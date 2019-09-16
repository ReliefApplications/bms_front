import { TextModelField } from './custom-models/text-model-field';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { DateModelField } from './custom-models/date-model-field';
import { FormGroup } from '@angular/forms';

export class Log extends CustomModel {

    title = this.language.logs;

    public fields = {
        url: new TextModelField({}),
        method: new TextModelField({}),
        request: new TextModelField({}),
        tabName: new TextModelField({}),
        id: new NumberModelField(
            {
                title: this.language.log_field_id,
                isDisplayedInModal: false,
                isDisplayedInTable: false,
            }
        ),
        objectOfAction: new TextModelField(
            {
                title: this.language.log_field_object,
                isDisplayedInModal: true,
                isDisplayedInTable: true
            }
        ),
        details: new TextModelField(
            {
                title: this.language.log_field_details,
                isDisplayedInModal: true,
                isDisplayedInTable: false,
                isLongText: true
            }
        ),
        action: new TextModelField(
            {
                title: this.language.log_field_action,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
        status: new TextModelField(
            {
                title: this.language.log_field_status,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
        date: new DateModelField(
            {
                title: this.language.log_field_date,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                displayTime: true
            }
        ),
        user: new TextModelField(
            {
                title: this.language.log_field_user,
                isDisplayedInModal: true,
                isDisplayedInTable: true
            }
        ),
        country: new TextModelField(
            {
                title: this.language.log_field_country,
                isDisplayedInModal: true,
                isDisplayedInTable: true
            }
        )
    };

    constructor() {
        super();
    }

    public static apiToModel(logFromApi: any): Log {
        const newLog = new Log();
        const url = logFromApi.url;
        const method = logFromApi.method;
        const request = logFromApi.request;
        const status = logFromApi.http_status;
        let urlMatch = [];

        // Assign all fields
        newLog.set('id', logFromApi.id);
        newLog.set('date', DateModelField.formatDateTimeFromApi(logFromApi.date));
        newLog.set('user', logFromApi.mail_user);
        newLog.set('url', url);
        newLog.set('method', method);
        newLog.set('request', request);
        newLog.set('status', status);
        newLog.set('country', JSON.parse(logFromApi.request).__country);

        // Group the logs that are related in the same tab.
        if (url.includes('users') || url.includes('donor') || url.includes('organization')) {
            newLog.set('tabName', 'administrative');
        } else if ((url.includes('project') || url.includes('distribution')) && !url.includes('households')) {
            newLog.set('tabName', 'distributions');
        } else if (url.includes('beneficiaries') || url.includes('households')) {
            newLog.set('tabName', 'beneficiaries');
        } else if (url.includes('vouchers') || url.includes('products') || url.includes('booklets') || url.includes('vendors')) {
            newLog.set('tabName', 'vouchers');
        } else {
            newLog.set('tabName', 'other');
        }

        // Assign messages corresponding to the status of the request
        switch (true) {
            case status >= 200 && status < 300:
                newLog.set('status', newLog.language.log_status_200);
                break;
            case status >= 300 && status < 400:
                newLog.set('status', newLog.language.log_status_300);
                break;
            case status >= 400:
                if (status === 401) {
                    newLog.set('status', newLog.language.log_status_401);
                } else if (status === 403) {
                    newLog.set('status', newLog.language.log_status_403);
                } else if (status === 404) {
                    newLog.set('status', newLog.language.log_status_404);
                } else {
                    newLog.set('status', newLog.language.log_status_400);
                }
                break;
            default: break;
        }

        // Assign an action, the object of the action and interesting details if any.
        // All possible urls are commented with their respective message
        switch (method) {
            case 'PUT':
            {
                newLog.set('action', newLog.language.log_created);
                if (/.+\/distributions\/[0-9]+\/beneficiary/.test(url)) {
                    // Distribution beneficiaries added (/distributions/{id}/beneficiary)
                    newLog.set('action', newLog.language.log_add);
                    newLog.set('objectOfAction', newLog.language.log_distributions
                        + ' ' + newLog.language.log_beneficiaries);
                    // DETAILS ON SERVICE (Distribution & Beneficiaries name)
                } else {
                    // urls = /distributions || /country_specifics || /households || /donors
                    // || /users || /booklets  || (/projects || /products || /vendors || ?/vouchers?)
                    urlMatch = url.match(/.+\/(.+)/);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);

                    if (url.includes('distributions')) {
                        newLog.set('details', newLog.language.log_distributions + ': ' + request.match(/.*"name":"(.*?)"/)[1]);
                    } else if (url.includes('country_specifics')) {
                        newLog.set('details', newLog.language.log_field + ': ' + request.match(/"field":"(.*?)"/)[1]);
                    } else if (url.includes('households')) {
                        newLog.set('details', newLog.language.log_family_name + ': ' + request.match(/"local_family_name":"(.*?)".+/)[1]);
                    } else if (url.includes('donors')) {
                        newLog.set('details', newLog.language.log_donors + ': ' + request.match(/"shortname":"(.*?)"/)[1]);
                    } else if (url.includes('users')) {
                        newLog.set('details', newLog.language.log_username + ': ' + request.match(/"username":"(.*?)"/)[1]);
                    } else if (url.includes('booklets')) {
                        newLog.set('details', newLog.language.log_number_booklets + ': ' + request.match(/"number_booklets":([0-9]+)/)[1]
                        + '\n'  + newLog.language.log_number_vouchers + ': ' + request.match(/"number_vouchers":([0-9]+)/)[1]
                        + '\n'  + newLog.language.log_value + ': ' + request.match(/.+\["([0-9]+)/)[1]);
                    } else {
                        newLog.set('details', newLog.language.log_name + ': ' + request.match(/"name":"(.*?)"/)[1]);
                    }
                }
            }
            break;

            case 'DELETE':
            {
                if (/.+\/deactivate-booklets\/[0-9]+/.test(url)) {
                    // Booklets deactivated (/deactivate-booklets)
                    urlMatch = url.match(/.+\/deactivate-booklets\/([0-9]+)/);
                    newLog.set('action', newLog.language.log_deactivate);
                    newLog.set('objectOfAction', newLog.language.log_booklets);
                    newLog.set('details', newLog.language.log_old_id + ': ' + urlMatch[1]);
                } else {
                    newLog.set('action', newLog.language.log_delete);
                    if (/.+\/vouchers\/delete_batch/.test(url)) {
                        // Batch of vouchers deleted(/vouchers/delete_batch)
                        newLog.set('objectOfAction', newLog.language.log_batch_vouchers);
                        newLog.set('details', newLog.language.log_no_details);
                    } else {
                        // urls = /country_specifics/{id} || /households/{id} || /donors/{id} || /projects/{id}
                        // || /users/{id} || /booklets/{id} || /products/{id} || /vendors/{id} || /vouchers/{id}
                        urlMatch = url.match(/.+\/(.+)\/([0-9]+)/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                        newLog.set('details',  newLog.language.log_old_id + ': ' + urlMatch[2]);
                    }
                }
            }
            break;

            case 'POST':
                if (url.includes('deactivate-booklets')) {
                    // Booklets deactivated (/deactivate-booklets)
                    newLog.set('action', newLog.language.log_deactivate);
                    newLog.set('objectOfAction', newLog.language.log_booklets);
                    newLog.set('details', newLog.language.log_codes + ': '
                        + request.match(/.*"bookletCodes":\["(.*?)"\]/)[1].replace('\",\"', ', '));
                } else if (url.includes('scanned')) {
                    // Voucher scanned (/vouchers/scanned)
                    newLog.set('action', newLog.language['log_scanned']);
                    newLog.set('objectOfAction', newLog.language['log_vouchers']);
                    newLog.set('details', newLog.language.log_no_details);
                } else if (url.includes('import')) {
                    // Households imported (/import/households)
                    // Project households from region imported (/import/api/households/project/{id})
                    // Project households imported (/import/households/project/{id})
                    // Distribution beneficiaries imported (/import/beneficiaries/distributions/{id})
                    urlMatch = url.match(/.*\/.*?\/.*?\/(.*?)\/(.*?)\/[0-9]+/);
                    newLog.set('action', newLog.language.log_import);
                    if (/.*\/import\/households$/.test(url)) {
                        newLog.set('objectOfAction', newLog.language.log_households);
                    } else if (/.*\/import\/api\/.*?\/.*?\/[0-9]+/.test(url)) {
                        newLog.set('objectOfAction', newLog.language.log_region + ' ' + newLog.language.log_project + ' '
                        + newLog.language.log_households);
                    } else {
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]
                            + ' ' + newLog.language['log_' + urlMatch[1]]);
                    }
                    // DETAILS ON SERVICE (distribution, project)
                } else if (url.includes('transaction')) {
                    // Mobile money sent (/transaction/distribution/{id}/send)
                    // Transaction code sent (/transaction/distribution/{id}/email)
                    urlMatch = url.match(/.*\/[0-9]+\/(.*)/);
                    newLog.set('action', newLog.language.log_transaction);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    // DETAILS ON SERVICE (distribution)
                } else if (url.includes('assign')) {
                    // Booklets assigned (/booklets/assign/{benefId}/{distId})
                    newLog.set('action', newLog.language.log_assign);
                    newLog.set('objectOfAction', newLog.language.log_booklets);
                    // DETAILS ON SERVICE (beneficiary, distribution, booklet code)
                } else if (url.includes('archive') || url.includes('complete')) {
                    // Distribution archived (/distributions/archive/{id})
                    // Vendor archived (/vendors/archive/{id})
                    // Distribution completed (/distributions/complete/{id})
                    urlMatch = url.match(/.*\/(.*?)\/(.*?)\/[0-9]+/);
                    newLog.set('action', newLog.language['log_' + urlMatch[2]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    // DETAILS ON SERVICE (distribution, vendor)
                } else if (url.includes('validate')) {
                    // Distribution validated (/distributions/{id}/validate)
                    newLog.set('action', newLog.language.log_validate);
                    newLog.set('objectOfAction', newLog.language.log_distributions);
                    newLog.set('details', 'distributions');
                    // DETAILS ON SERVICE
                } else if (url.includes('remove')) {
                    // Distribution beneficiary removed
                    // (/distributions/{distId}/beneficiaries/{benefId}/remove)
                    newLog.set('action', newLog.language.log_remove);
                    newLog.set('objectOfAction', newLog.language.log_distributions
                        + ' ' + newLog.language.log_beneficiary);
                    // DETAILS ON SERVICE (distribution, beneficiary)
                } else if (url.includes('generalrelief')) {
                    if (url.includes('notes')) {
                        // General relief item notes added (/distributions/generalrelief/notes)
                        newLog.set('action', newLog.language['log_add']);
                        newLog.set('objectOfAction', newLog.language['log_general_relief_item']
                            + ' ' + newLog.language['log_notes']);
                    } else {
                        // General relief item distributed (/distributions/generalrelief/distributed)
                        newLog.set('action', newLog.language.log_distributed);
                        newLog.set('objectOfAction', newLog.language.log_general_relief_item);
                    }
                    newLog.set('details', newLog.language.log_no_details);
                    // DETAILS ??item and distribution?? (ids on request) -> REQUIRES BACKEND LOGIC
                } else if (url.includes('add')) {
                    // Project beneficiaries added (/projects/{id}/beneficiaries/add)
                    newLog.set('action', newLog.language.log_add);
                    newLog.set('objectOfAction', newLog.language.log_project
                        + ' ' + newLog.language.log_beneficiaries);
                    // DETAILS ON SERVICE (project) + ??beneficiaries?? (id on request)
                } else if (url.includes('upload')) {
                    // Product image uploaded (/products/upload/image)
                    // Donor logo uploaded (/donor/upload/logo)
                    // Organization logo uploaded (/organization/upload/logo)
                    urlMatch = url.match(/.*\/(.*)\/upload\/(.*)/);
                    newLog.set('action', newLog.language.log_upload);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]
                        + ' ' + newLog.language['log_' + urlMatch[2]]);
                    newLog.set('details', newLog.language.log_no_details);
                } else {
                    newLog.set('action', newLog.language.log_edit);
                    if (url.includes('update')) {
                        // Booklet password edited (/booklets/update/password)
                        newLog.set('objectOfAction', newLog.language.log_booklets + ' ' + newLog.language.log_password);
                        newLog.set('details', newLog.language.log_codes + ': '
                                + request.match(/.*"code":"(.*?)"/)[1]);
                    } else if (url.includes('provider')) {
                        // 3rd party connection edited (/financial/provider)
                        newLog.set('objectOfAction', newLog.language.log_provider);
                        newLog.set('details', newLog.language.log_username + ': '
                                + request.match(/.*"username":"(.*?)"/)[1]);
                    } else if (url.includes('users') && (url.includes('password') || url.includes('language'))) {
                        // Default language edited (/users/{id}/language)
                        // Password edited (/users/{id}/password)
                        urlMatch = url.match(/.*\/[0-9]+\/(.*)/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                        newLog.set('details', newLog.language.log_no_details);
                    } else {
                        urlMatch = url.match(/.*\/(.*)\/[0-9]*/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                        if (url.includes('beneficiaries')) {
                            newLog.set('objectOfAction', newLog.language.log_beneficiary);
                            // Beneficiary edited (/beneficiaries/{id})
                            newLog.set('details', newLog.language.log_name + ': '
                                + request.match(/.*"local_given_name":"(.*?)"/)[1]);
                        } else if (url.includes('households')) {
                            // Household edited (/households/{id})
                            newLog.set('details', newLog.language.log_family_name + ': '
                                + request.match(/.*"local_family_name":"(.*?)"/)[1]);
                        } else if (url.includes('booklets')) {
                            // Booklet edited (/booklets/{id})
                            newLog.set('details', newLog.language.log_codes + ': '
                                + request.match(/.*"code":"(.*?)"/)[1]);
                        } else if (url.includes('donors')) {
                            // Booklet edited (/donors/{id})
                            newLog.set('details', newLog.language.log_name + ': '
                                + request.match(/.*"shortname":"(.*?)"/)[1]);
                        } else if (url.includes('country_specifics')) {
                            // Country specific option edited (/country_specifics/{id})
                            newLog.set('details', newLog.language.log_field + ': '
                                + request.match(/.*"field":"(.*?)"/)[1]);
                        } else if (url.includes('users') || url.includes('vendors')) {
                            // User edited (/users/{id})
                            // Vendor edited (/vendors/{id})
                            newLog.set('details', newLog.language.log_username + ': '
                                + request.match(/.*"username":"(.*?)"/)[1]);
                        } else if (url.includes('distributions')) {
                            // Distribution edited (/distributions/{id})
                            // DISTRIBUTION EDITION BUG STILL NEEDS TO BE FIXED
                        } else {
                            // Organization edited (/organization/{id})
                            // Project edited (/projects/{id})
                            // Product edited (/products/{id})
                            newLog.set('details', newLog.language.log_name + ': '
                                + request.match(/.*"name":"(.*?)"/)[1]);
                        }
                    }
                }
                break;
            default: break;
        }
        return newLog;
    }
}


