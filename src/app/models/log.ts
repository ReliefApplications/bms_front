import { TextModelField } from './custom-models/text-model-field';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { DateModelField } from './custom-models/date-model-field';

export class Log extends CustomModel {

    title = this.language.log;

    public fields = {
        url: new TextModelField({}),
        tabName: new TextModelField({}),
        id: new NumberModelField(
            {
                title: 'Id',
                isDisplayedInModal: false,
                isDisplayedInTable: true,
            }
        ),
        objectOfAction: new TextModelField(
            {
                title: 'Object',                      // this.language.something
                isDisplayedInModal: true,
                isDisplayedInTable: true
            }
        ),
        details: new TextModelField(
            {
                title: 'Details',
                isDisplayedInModal: true,
                isDisplayedInTable: false,
            }),
        action: new TextModelField(
            {
                title: 'Action',
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
        status: new TextModelField(
            {
                title: 'Status',                      // this.language.something
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
        date: new DateModelField(
            {
                title: 'Date',
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                displayTime: true
            }
        ),
        user: new TextModelField(
            {
                title: 'User',
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }),
        country: new TextModelField({
            title: 'Country',
            isDisplayedInModal: true,
            isDisplayedInTable: true
        })
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

        // Assign all fields
        newLog.set('id', logFromApi.id);
        newLog.set('date', DateModelField.formatDateTimeFromApi(logFromApi.date));
        newLog.set('user', logFromApi.mail_user);
        newLog.set('url', url);
        newLog.set('method', method);
        newLog.set('request', request);
        newLog.set('status', status);

        let urlMatch = [];
        newLog.set('country', JSON.parse(logFromApi.request).__country);

        if (url.includes('users') || url.includes('donor') || url.includes('organization')) {
            newLog.set('tabName', 'administrative');
        } else if ((url.includes('project') || url.includes('distribution')) && !url.includes('households')) {
            newLog.set('tabName', 'distributions');
        } else if (url.includes('beneficiaries') || url.includes('households')) {
            newLog.set('tabName', 'beneficiaries');
        } else if (url.includes('vouchers') || url.includes('products') || url.includes('booklets') || url.includes('vendors')) {
            newLog.set('tabName', 'vouchers');
        }
        else {
            newLog.set('tabName', 'other');
        }

        switch (true) {
            case status >= 200 && status < 300:
                newLog.set('status', 'success');
                break;
            case status >= 300 && status < 400:
                newLog.set('status', 'redirection');
                break;
            case status >= 400:
                if (status === 401) {
                    newLog.set('status', 'unauthenticated');
                } else if (status === 403) {
                    newLog.set('status', 'forbidden');
                } else if (status === 404) {
                    newLog.set('status', 'not found');
                } else {
                    newLog.set('status', 'error');
                }
                break;
        }
        let detailString;
        switch (method) {
            case 'PUT':
                newLog.set('action', 'created');
                if (/.+\/(distributions)\/[0-9]+\/(beneficiary)/.test(url)) {
                    urlMatch = url.match(/.+\/(distributions)\/([0-9])+\/(beneficiary)/);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[3] + '_in_' + urlMatch[1]]);
                    detailString  = request.match(/"local_given_name":"(.*?)"/)[1] + ' in distribution ' + urlMatch[2];
                    newLog.set('details', detailString);
                } else {
                    urlMatch = url.match(/.+\/(.+)/);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    //  Testing
                    if (url.includes('distributions')) {
                        newLog.set('details', request.match(/.*"name":"(.*?)"/)[1]);
                    } else if (url.includes('country_specifics')) {
                        newLog.set('details', request.match(/"field":"(.*?)"/)[1]);
                    } else if (url.includes('households')) {
                        newLog.set('details', request.match(/"local_family_name":"(.*?)"/)[1]);
                    } else if (url.includes('donors')) {
                        newLog.set('details', request.match(/"shortname":"(.*?)"/)[1]);
                    } else if (url.includes('users')) {
                        newLog.set('details', request.match(/"username":"(.*?)"/)[1]);
                    } else if (url.includes('booklets')) {
                        newLog.set('details', request.match(/"number_booklets":([0-9])+/)[1] + ' booklet/s with '
                            + request.match(/"number_vouchers":([0-9])+/)[1] + ' voucher/s each');
                    } else {
                        newLog.set('details', request.match(/"name":"(.*?)"/)[1]);
                    }
                }
                break;

            case 'DELETE':
                if (/.+\/deactivate-booklets\/[0-9]+/.test(url)) {
                    urlMatch = url.match(/.+\/(deactivate)-(booklets)\/([0-9])+/);
                    newLog.set('action', 'log_' + urlMatch[1]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]);
                    newLog.set('details', urlMatch[3]);
                } else {
                    newLog.set('action', 'deleted');
                    if (/.+\/vouchers\/delete_batch/.test(url)) {
                        newLog.set('objectOfAction', newLog.language['log_delete_batch_vouchers']);
                    } else {
                        urlMatch = url.match(/.+\/(.+)\/([0-9])+/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                        newLog.set('details', urlMatch[2]);
                    }
                }
                break;

            case 'POST':
                newLog.set('action', 'Action Failed');
                newLog.set('objectOfAction', 'Object Failed');

                // First of all, we treat the urls that have nothing to do with the rest

                if (url.includes('deactivate-booklets')) {
                    // Booklets deactivated (/deactivate-booklets)
                    newLog.set('action', newLog.language['log_deactivate']);
                    newLog.set('objectOfAction', newLog.language['log_booklets']);
                    newLog.set('details', request.match(/(?<="bookletCodes":\[")(.*)(?="])/)[1]);
                } else if (url.includes('scanned')) {
                    // Voucher scanned (/vouchers/scanned)
                    newLog.set('action', newLog.language['log_scanned']);
                    newLog.set('objectOfAction', newLog.language['log_vouchers']);
                    newLog.set('details', newLog.language['log_no_details']);
                } else if (url.includes('import')) {
                    // Beneficiary/ies in distribution imported (/import/beneficiaries/distributions/{id})
                    // Household/s in project imported (/import/households/project/{id})
                    urlMatch = url.match(/.*\/(.*?)\/(.*?)\/(.*?)\/([0-9]*)/);
                    newLog.set('action', newLog.language['log_import']);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]
                        + ' in ' + newLog.language['log_' + urlMatch[3]]);
                    if (urlMatch[1].includes('api')) {
                        newLog.set('objectOfAction', newLog.get('objectOfAction')
                            + ' from ' + newLog.language['log_region']);
                    }
                    // DETAILS [4] distribution/beneficiary name + adm3 from request
                } else if (url.includes('transaction')) {
                    // Mobile money sent (/transaction/distribution/{id}/send)
                    // Transaction code sent (/transaction/distribution/{id}/email)
                    urlMatch = url.match(/.*\/(transaction)\/distribution\/([0-9]*)\/(.*)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[1]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[3]]);
                    // DETAILS [2] distribution name
                } else if (url.includes('assign')) {
                    // Assigned a booklet to a beneficiary in a distribution (/booklets/assign/{benefId}/{distId})
                    urlMatch = url.match(/.*\/(.*?)\/(.*?)\/(.*?)\/(.*)/);
                    newLog.set('action', newLog.language['log_assign']);
                    newLog.set('objectOfAction', newLog.language['log_booklets'] + ' to '
                        + newLog.language['log_beneficiary_in_distributions']);
                    // DETAILS [3] beneficiary name, [4] distribution name + code from request
                } else if (url.includes('archive') || url.includes('complete')) {
                    // Distribution archived (/distributions/archive/{id})
                    // Vendor archived (/vendors/archive/{id})
                    // Distribution completed (/distributions/complete/{id})
                    urlMatch = url.match(/.*\/(.*?)\/(.*?)\/([0-9]*)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[2]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    // DETAILS [3] distribution/vendor name
                } else if (url.includes('validate')) {
                    // Distribution validated (/distributions/{id}/validate)
                    urlMatch = url.match(/.*\/(.*?)\/([0-9]*)\/(.*)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[3]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    // DETAILS [2] distribution name
                } else if (url.includes('remove')) {
                    // Beneficiary from distribution removed
                    // (/api/wsse/distributions/{distId}/beneficiaries/{benefId}/remove)
                    urlMatch = url.match(/.*\/(.*?)\/([0-9]*)\/(.*?)\/([0-9]*)\/(.*)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[5]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[3]]
                        + ' from ' + newLog.language['log_' + urlMatch[1]]);
                    // DETAILS [2] distribution name, [4] beneficiary name + justification from request
                } else if (url.includes('notes')) {
                    // Notes in general relief item added (/distributions/generalrelief/notes)
                    newLog.set('action', newLog.language['log_add']);
                        newLog.set('objectOfAction', newLog.language['log_notes']
                        + ' in' + newLog.language['log_general_relief_item']);
                    // DETAILS item and distribution name from request
                } else if (url.includes('distributed')) {
                    // General relief item distributed (/distributions/generalrelief/distributed)
                    newLog.set('action', newLog.language['log_distributed']);
                    newLog.set('objectOfAction', newLog.language['log_general_relief_item']);
                    // DETAILS item and distribution name from request
                } else if (url.includes('add')) {
                    // Beneficiaries in project added (/projects/{id}/beneficiaries/add)
                    urlMatch = url.match(/.*\/(.*?)\/([0-9]*)\/(.*?)\/(.*)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[4]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[3]]
                        + ' in ' + newLog.language['log_' + urlMatch[1]]);
                    // DETAILS [2] project name, beneficiaries names from request
                } else if (url.includes('upload')) {
                    // Product image uploaded (/products/upload/image)
                    // Donor logo uploaded (/donor/upload/logo)
                    // Organization logo uploaded (/organization/upload/logo)
                    urlMatch = url.match(/.*\/(.*)\/(.*)\/(.*)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[2]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]
                        + ' ' + newLog.language['log_' + urlMatch[3]]);
                    newLog.set('details', newLog.language['log_no_details']);
                } else {
                    newLog.set('action', newLog.language['log_edit']);
                    if (url.includes('update')) {
                        // Booklet password edited (/booklets/update/password)
                        newLog.set('objectOfAction', newLog.language['log_booklets'] + newLog.language['log_password']);
                        // DETAILS code from request
                    } else if (url.includes('provider')) {
                        // 3er party connection edited (/financial/provider)
                        newLog.set('objectOfAction', newLog.language['log_provider']);
                        // DETAILS new name from request
                    } else if (url.includes('users') && (url.includes('password') || url.includes('language'))) {
                            // Default language edited (/users/{id}/language)
                            // Password edited (/users/{id}/password)
                            urlMatch = url.match(/.*\/([0-9]*)\/(.*)/);
                            newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]);
                            // DETAILS [1] user name (+ language from request)}
                    } else {
                        // Beneficiary edited (/beneficiaries/{id})
                        // Country specific option edited (/country_specifics/{id})
                        // Household edited (/households/{id})
                        // Organization edited (/organization/{id})
                        // Distribution edited (/distributions/{id})
                        // Project edited (/projects/{id})
                        // User edited (/users/{id})
                        // Booklet edited (/booklets/{id})
                        // Product edited (/products/{id})
                        // Vendor edited (/vendors/{id})
                        urlMatch = url.match(/.*\/(.*)\/[0-9]*/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);

                        switch (urlMatch[1]) {
                            case 'beneficiaries':
                                newLog.set('details', request.match(/.*"local_given_name":"(.*?)"/)[1]);
                                break;
                            case 'households':
                                newLog.set('details', request.match(/.*"local_family_name":"(.*?)"/)[1]);
                                break;
                            case 'distributions':
                                newLog.set('details', request.match(/.*"NOT WORKING":"(.*?)"/)[1]);
                                break;
                            case 'projects':
                                newLog.set('details', request.match(/.*"name":"(.*?)"/)[1]);
                                break;
                            case 'organization':
                                newLog.set('details', request.match(/.*"name":"(.*?)"/)[1]);
                                break;
                            case 'booklets':
                                newLog.set('details', request.match(/.*"code":"(.*?)"/)[1]);
                                break;
                            case 'products':
                                newLog.set('details', request.match(/.*"name":"(.*?)"/)[1]);
                                break;
                            case 'vendors':
                                newLog.set('details', request.match(/.*"username":"(.*?)"/)[1]);
                                break;
                            case 'users':
                                newLog.set('details', request.match(/.*"username":"(.*?)"/)[1]);
                                break;
                            case 'country-specifics':
                                newLog.set('details', request.match(/.*"field":"(.*?)"/)[1]);
                                break;
                        }
                    }
                }
        }
        return newLog;
    }
}


