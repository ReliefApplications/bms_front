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
        const request = logFromApi.request;
        const status = logFromApi.http_status;

        // To filter bad logs
        if (/.+\/households\/get\/.+/.test(url) || /.+\/export/.test(url) || /.+\/location.+/.test(url)
            || /.+\/distributions\/criteria\/project\/\d+\/number/.test(url) || /.+\/login.+/.test(url)
            || /.+\/distributions\/beneficiaries\/project\/\d+/.test(url) || /.+\/indicators/.test(url)
            || /.+\/deactivate-booklets/.test(url) || /.+\/booklets-print/.test(url) || /.+\/vouchers\/scanned/.test(url)) {
            return null;
        }

        // Assign all initial fields
        newLog.set('id', logFromApi.id);
        newLog.set('date', DateModelField.formatDateTimeFromApi(logFromApi.date));
        newLog.set('user', logFromApi.mail_user);
        newLog.set('url', url);
        newLog.set('request', request);
        newLog.set('country', JSON.parse(request).__country);

        // Action and Object
        const controller = /^\w+\\\w+\\(\w+)Controller::(\w+)Action$/g.exec(logFromApi.controller);
        controller.shift();

        newLog.set('objectOfAction', controller[0]);
        const action = controller[1].split(/(?=[A-Z])/).join('_').toLowerCase();
        newLog.set('action', newLog.language['log_' + action]);

        // Tab name
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

        // Details
        newLog.set('details', null);
        let detailString = '';
        if (action.includes('update') || action.includes('create')) {
            if (controller[0] === 'Household' || controller[0] === 'Beneficiary'
                || controller[0] === 'Vendor' || controller[0] === 'Donor') {
                newLog.set('details', newLog.language['log_' + controller[0].toLowerCase()] + ': ' + /name":"(.*?)".+/g.exec(request)[1]);
            } else if (controller[0] === 'CountrySpecific') {
                newLog.set('details', newLog.language.log_field + ': ' + /field":"(.*?)"/.exec(request)[1]);
            } else if (controller[0] === 'Booklet') {
                if (action.includes('update')) {
                    detailString = newLog.language.log_code + ': ' + /code":"(.+?)".+/.exec(request)[1] + '\n';
                }
                newLog.set('details', detailString + newLog.language.log_value + ': ' + /values":\["(.+?)".+/.exec(request)[1]);
            } else {
                newLog.set('details', newLog.language['log_' + controller[0].toLowerCase()] + ': ' + /.+name":"(.*?)"/g.exec(request)[1]);
            }
        } else if (action.includes('delete')) {
            newLog.set('details', newLog.language.log_old_id + ': ' + /(\d+)/g.exec(url)[1]);
        } else if (controller[0] === 'Voucher' || action.includes('post') || action.includes('relief') || action.includes('upload')) {
            newLog.set('details', newLog.language.log_no_details);
        } else if (url.includes('delete')) {
            let idMatched = request.match(/(\d+)/g);
            if (!idMatched && JSON.parse(request).ids && JSON.parse(request).ids.length) {
                idMatched = JSON.parse(request).ids;
            }

            if (idMatched) {
                idMatched.forEach((id: Number) => {
                    detailString += id + ', ';
                });
                newLog.set('details', newLog.language.log_old_id + ': ' + detailString.substring(0, detailString.length - 2));
            } else {
                newLog.set('details', newLog.language.log_delete);
            }

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
    }
}
