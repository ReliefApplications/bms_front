import { TextModelField } from './custom-models/text-model-field';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { DateModelField } from './custom-models/date-model-field';

export class Log extends CustomModel {

    public fields = {
        id: new NumberModelField({}),
        date: new DateModelField(
            {
                title: '',                      // this.language.log_date
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                displayTime: true
            }
        ),
        user: new TextModelField(
            {
                title: '',
                isDisplayedInModal: true,
                isDisplayedInTable: true,
        }),
        action: new TextModelField(
            {
                title: '',                      // this.language.action
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
        objectOfAction: new TextModelField(
            {
                title: '',                      // this.language.something
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
        nameOfObject: new TextModelField(
            {
                title: '',
                isDisplayedInModal: true,
                isDisplayedInTable: true,
        }),
        status: new TextModelField(
            {
                title: '',                      // this.language.something
                isDisplayedInModal: true,
                isDisplayedInTable: true,
            }
        ),
    };

    constructor() {
        super();
    }

    public static apiToModel(logFromApi: any): Log {
        const newLog = new Log();

        // Assign default fields
        newLog.set('id', logFromApi.id);
        newLog.set('date', DateModelField.formatFromApi(logFromApi.date));
        newLog.set('user', logFromApi.mail_user);
        const url = logFromApi.url;
        const method = logFromApi.method;
        const urlMatch = url.match(/\/(.+)\/([0-9]+)/);

        switch (method) {
            case 'PUT':
                newLog.set('action', 'created');
                if (/\/distributions\/[0-9]+\/beneficiary/.test(url)) {
                    newLog.set('objectOfAction', 'beneficiary in distribution');
                } else {
                    newLog.set('objectOfAction', newLog.language[url.substring(0)]);
                }
                break;
            case 'DELETE':
                if (/\/deactivate-booklets\/[0-9]+/.test(url)) {
                    newLog.set('action', 'deactivated');
                    newLog.set('objectOfAction', 'booklet');
                } else {
                    newLog.set('action', 'deleted');
                    if (/\/vouchers\/delete_batch/) {
                        newLog.set('objectOfAction', 'a batch of voucher');
                    } else {
                        newLog.set('objectOfAction', newLog.language[urlMatch[0]]);
                    }
                }
                break;
            case 'POST':
                if (/\/deactivate-booklets\/[0-9]+/.test(url)) {
                    newLog.set('action', 'deactivated');
                    newLog.set('objectOfAction', 'booklets');
                } else {
                    if (urlMatch) {
                        newLog.set('action', 'edited');
                        newLog.set('objectOfAction', newLog.language[urlMatch[0]]);
                    } else {
                        const actions = ['import', 'validate', 'remove', 'archive', 'complete',
                        'notes', 'distributed', 'add', 'transaction', 'assign', 'scanned', 'delete', 'upload'];
                        actions.forEach((word: string) => {
                            if (url.includes(word)) {
                                newLog.set('action', newLog.language['log_' + word]);
                            }
                        });
                    }
                    if (url.includes('households')) {
                        newLog.set('objectOfAction', 'households to a project');
                    } else if (url.includes('distributions')) {
                        if (url.includes('beneficiaries')) {
                            newLog.set('objectOfAction', 'a beneficiary in a distribution');
                        } else if (url.includes('generalrelief')) {
                            newLog.set('objectOfAction', 'a general relief item in a distribution');
                        } else {
                            newLog.set('objectOfAction', 'a distribution');
                        }
                    } else if (url.includes('projects')) {
                        newLog.set('objectOfAction', 'beneficiaries to a project');
                    } else if (url.includes('send')) {
                        newLog.set('objectOfAction', 'a transaction');
                    } else if (url.includes('email')) {
                        newLog.set('objectOfAction', 'a transaction\'s code');
                    } else if (url.includes('financial')) {
                        newLog.set('objectOfAction', 'a third party connection');
                    } else if (url.includes('users')) {
                        newLog.set('objectOfAction', 'the language');
                    } else if (url.includes('password')) {
                        newLog.set('objectOfAction', 'the password');
                    } else if (url.includes('assign')) {
                        newLog.set('objectOfAction', 'a beneficiary in a distribution');
                    } else if (url.includes('vendors')) {
                        newLog.set('objectOfAction', 'a vendor');
                    } else if (url.includes('products')) {
                        newLog.set('objectOfAction', 'a product');
                    } else if (url.includes('organization')) {
                        newLog.set('objectOfAction', 'the organization');
                    } else if (url.includes('donor')) {
                        newLog.set('objectOfAction', 'a donor');
                    } else if (url.includes('vouchers')) {
                        newLog.set('objectOfAction', 'a voucher');
                    }
                }
                break;
            }
        const status = logFromApi.http_status;
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
                    newLog.set('status', 'Error');
                }
                break;
        }
        return newLog;
    }
}
