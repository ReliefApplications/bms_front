import { TextModelField } from './custom-models/text-model-field';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { DateModelField } from './custom-models/date-model-field';

export class Log extends CustomModel {

    title = this.language.logs;

    public fields = {
        url: new TextModelField({}),
        request: new TextModelField({}),
        tabName: new TextModelField({}),
        id: new NumberModelField(
            {
                title: this.language.log_field_id,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
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
        ),
        controller: new TextModelField({
            title: 'Controller',
            isDisplayedInModal: false,
            isDisplayedInTable: false
        })
    };

    constructor() {
        super();
    }

    public static apiToModel(logFromApi: any): Log {
        const newLog = new Log();
        const url = logFromApi.url;
        const request = logFromApi.request;
        const status = logFromApi.http_status;

        // To filter bad logs
        if (/.+\/households\/get\/.+/.test(url) || /.+\/export/.test(url) || /.+\/location.+/.test(url)
            || /.+\/distributions\/criteria\/project\/\d+\/number/.test(url) || /.+\/login.+/.test(url)
            || /.+\/distributions\/beneficiaries\/project\/\d+/.test(url) || /.+\/indicators/.test(url)
            || /.+\/deactivate-booklets/.test(url) || /.+\/booklets-print/.test(url) || /.+\/vouchers\/scanned/.test(url)) {
            return null;
        }

        // Assign all fields
        newLog.set('id', logFromApi.id);
        newLog.set('date', DateModelField.formatDateTimeFromApi(logFromApi.date));
        newLog.set('user', logFromApi.mail_user);
        newLog.set('url', url);
        newLog.set('request', request);
        newLog.set('country', JSON.parse(logFromApi.request).__country);
        newLog.set('details', null);
        const controller = /^\w+\\\w+\\(\w+)Controller::(\w+)Action$/g.exec(logFromApi.controller);
        controller.shift();

        newLog.set('objectOfAction', controller[0]);
        const action = controller[1].split(/(?=[A-Z])/).join('_').toLowerCase();
        newLog.set('action', newLog.language['log_' + action]);

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

        return newLog;


        {
        // Assign an action, the object of the action and interesting details if any.
        // switch (method) {
        //     case 'PUT':
        //         {
        //             if (url.includes('distributions')) {
        //                 newLog.set('details', newLog.language.log_distributions + ': ' + request.match(/.*"name":"(.*?)"/)[1]);
        //             } else if (url.includes('country_specifics')) {
        //                 newLog.set('details', newLog.language.log_field + ': ' + request.match(/"field":"(.*?)"/)[1]);
        //             } else if (url.includes('households')) {
        //                 newLog.set('details', newLog.language.log_family_name
        //                     + ': ' + request.match(/"local_family_name":"(.*?)".+/)[1]);
        //             } else if (url.includes('donors')) {
        //                 newLog.set('details', newLog.language.log_donors + ': ' + request.match(/"shortname":"(.*?)"/)[1]);
        //             } else if (url.includes('users')) {
        //                 newLog.set('details', newLog.language.log_username + ': ' + request.match(/"username":"(.*?)"/)[1]);
        //             } else if (url.includes('booklets')) {
        //                 newLog.set('details', newLog.language.log_number_booklets
        //                     + ': ' + request.match(/"number_booklets":([0-9]+)/)[1]
        //                     + '\n' + newLog.language.log_number_vouchers + ': ' + request.match(/"number_vouchers":([0-9]+)/)[1]
        //                     + '\n' + newLog.language.log_value + ': ' + request.match(/.+\["([0-9]+)/)[1]);
        //             } else {
        //                 newLog.set('details', newLog.language.log_name + ': ' + request.match(/"name":"(.*?)"/)[1]);
        //             }
        //         }
        //         break;

        //     case 'DELETE':
        //         {
        //             if (/.+\/deactivate-booklets\/[0-9]+/.test(url)) {
        //                 urlMatch = url.match(/.+\/deactivate-booklets\/([0-9]+)/);
        //                 newLog.set('details', newLog.language.log_old_id + ': ' + urlMatch[1]);
        //             } else {
        //                 if (/.+\/vouchers\/delete_batch/.test(url)) {
        //                     newLog.set('details', newLog.language.log_no_details);
        //                 } else {
        //                     urlMatch = url.match(/.+\/(.+)\/([0-9]+)/);
        //                     newLog.set('details', newLog.language.log_old_id + ': ' + urlMatch[2]);
        //                 }
        //             }
        //         }
        //         break;

        //     case 'POST':
        //         {
        //             if (url.includes('deactivate-booklets')) {
        //                 newLog.set('details', newLog.language.log_codes + ': '
        //                     + request.match(/.*"bookletCodes":\["(.*?)"\]/)[1].replace('\",\"', ', '));
        //             } else if (url.includes('scanned')) {
        //                 newLog.set('details', newLog.language.log_no_details);
        //             } else if (url.includes('import')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('transaction')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('assign')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('archive') || url.includes('complete')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('validate')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('remove')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('generalrelief')) {
        //                 newLog.set('details', newLog.language.log_no_details);
        //             } else if (url.includes('add')) {
        //                 newLog.set('details', null);
        //             } else if (url.includes('upload')) {
        //                 newLog.set('details', newLog.language.log_no_details);
        //             } else {
        //                 if (url.includes('update')) {
        //                     newLog.set('details', newLog.language.log_codes + ': '
        //                         + request.match(/.*"code":"(.*?)"/)[1]);
        //                 } else if (url.includes('provider')) {
        //                     newLog.set('details', newLog.language.log_username + ': '
        //                         + request.match(/.*"username":"(.*?)"/)[1]);
        //                 } else if (url.includes('users') && (url.includes('password') || url.includes('language'))) {
        //                     newLog.set('details', newLog.language.log_no_details);
        //                 } else {
        //                     urlMatch = url.match(/.*\/(.*)\/[0-9]*/);
        //                     if (url.includes('beneficiaries')) {
        //                         newLog.set('details', newLog.language.log_name + ': '
        //                             + request.match(/.*"local_given_name":"(.*?)"/)[1]);
        //                     } else if (url.includes('households')) {
        //                         newLog.set('details', newLog.language.log_family_name + ': '
        //                             + request.match(/.*"local_family_name":"(.*?)"/)[1]);
        //                     } else if (url.includes('booklets')) {
        //                         newLog.set('details', newLog.language.log_codes + ': '
        //                             + request.match(/.*"code":"(.*?)"/)[1]);
        //                     } else if (url.includes('donors')) {
        //                         newLog.set('details', newLog.language.log_name + ': '
        //                             + request.match(/.*"shortname":"(.*?)"/)[1]);
        //                     } else if (url.includes('country_specifics')) {
        //                         newLog.set('details', newLog.language.log_field + ': '
        //                             + request.match(/.*"field":"(.*?)"/)[1]);
        //                     } else if (url.includes('users') || url.includes('vendors')) {
        //                         newLog.set('details', newLog.language.log_username + ': '
        //                             + request.match(/.*"username":"(.*?)"/)[1]);
        //                     } else {
        //                         newLog.set('details', newLog.language.log_name + ': '
        //                             + request.match(/.*"name":"(.*?)"/)[1]);
        //                     }
        //                 }
        //             }
        //         }
        //         break;
        //     default: break;
        // }
        }
    }

}


