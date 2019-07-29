import { TextModelField } from './custom-models/text-model-field';
import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { DateModelField } from './custom-models/date-model-field';

export class Log extends CustomModel {

    public fields = {
        url: new TextModelField({}),
        tabName: new TextModelField({}),
        id: new NumberModelField(
            {
            title: 'Id',
            isDisplayedInModal: false,
            isDisplayedInTable: false,
            }
        ),
        objectOfAction: new TextModelField(
            {
                title: 'Object',                      // this.language.something
                isDisplayedInModal: true,
                isDisplayedInTable: true
            }
        ),
        nameOfObject: new TextModelField(
            {
                title: 'Name/s',
                isDisplayedInModal: true,
                isDisplayedInTable: false
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

        // Assign default fields
        newLog.set('id', logFromApi.id);
        newLog.set('date', DateModelField.formatDateTimeFromApi(logFromApi.date));
        newLog.set('user', logFromApi.mail_user);
        const url = logFromApi.url;
        const method = logFromApi.method;
        newLog.set('country', JSON.parse(logFromApi.request).__country);

        if (url.includes('users') || url.includes('donor') || url.includes('organization')) {
            newLog.set('tabName', 'administrative');
        } else if ((url.includes('project') ||  url.includes('distribution')) && !url.includes('households')) {
            newLog.set('tabName', 'distributions');
        } else if (url.includes('beneficiaries') || url.includes('households')) {
            newLog.set('tabName', 'beneficiaries');
        } else if (url.includes('vouchers') || url.includes('products') || url.includes('booklets') || url.includes('vendors')) {
            newLog.set('tabName', 'vouchers');
        }
        else {
            newLog.set('tabName', 'other');
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
        let urlMatch = [];

        switch (method) {
            case 'PUT':
                newLog.set('action', 'created');
                if (/.+\/(distributions)\/[0-9]+\/(beneficiary)/.test(url)) {
                    urlMatch = url.match(/.+\/(distributions)\/[0-9]+\/(beneficiary)/);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2] + '_in_' + urlMatch[1]]);
                } else {
                    urlMatch = url.match(/.+\/(.+)/);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                }
                break;

            case 'DELETE':
                if (/.+\/deactivate-booklets\/[0-9]+/.test(url)) {
                    urlMatch = url.match(/.+\/(deactivate)-(booklets)\/[0-9]+/);
                    newLog.set('action', 'log_' + urlMatch[1]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]);
                } else {
                    newLog.set('action', 'deleted');
                    if (/.+\/vouchers\/delete_batch/.test(url)) {
                        newLog.set('objectOfAction', newLog.language['log_delete_batch_vouchers']);
                    } else {
                        urlMatch = url.match(/.+\/(.+)\/[0-9]+/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    }
                }
                break;

            case 'POST':
                newLog.set('action', 'punched');
                newLog.set('objectOfAction', 'cats');

                // First of all, we treat the urls that have nothing to do with the rest
                if (url.includes('deactivate-booklets')) {
                    urlMatch = url.match(/.+\/(deactivate)-(booklets)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[1]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]);
                    // break;
                } else if (url.includes('import')) {
                    urlMatch = url.match(/.+\/(import)\/(.+)\/(.+)\/[0-9]+/);
                    newLog.set('action', newLog.language['log_' + urlMatch[1]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]
                        + ' in ' + newLog.language['log_' + urlMatch[3]]);
                    // break;
                } else if (url.includes('scanned')) {
                    newLog.set('action', newLog.language['log_scanned']);
                    newLog.set('objectOfAction', newLog.language['log_vouchers']);
                    // break;
                } else if (url.includes('transaction')) {
                    urlMatch = url.match(/.+\/(transaction)\/distribution\/[0-9]+\/(.+)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[1]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]);
                    // break;
                } else if (url.includes('assign')) {
                    newLog.set('action', newLog.language['log_assign']);
                    newLog.set('objectOfAction', newLog.language['log_booklets'] + ' to '
                        + newLog.language['log_beneficiary_in_distributions']);
                }
                 // Next 4 could be merged (need to change validate url order)
                 else if (url.includes('archive')) {
                    urlMatch = url.match(/.+\/(.+)\/archive\/[0-9]+/);
                    newLog.set('action', newLog.language['log_archive']);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    // break;
                 } else if (url.includes('validate')) {
                    newLog.set('action', newLog.language['log_validate']);
                    newLog.set('objectOfAction', newLog.language['log_distributions']);
                } else if (url.includes('complete')) {
                    newLog.set('action', newLog.language['log_complete']);
                    newLog.set('objectOfAction', newLog.language['log_distributions']);
                    // break;
                } else if (url.includes('users') && (url.includes('password') || url.includes('language'))) {
                    urlMatch = url.match(/.+\/users\/[0-9]+\/(.+)/);
                    newLog.set('action', newLog.language['log_edit']);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                    // break;
                }
                // For the moment until here
                else if (url.includes('remove')) {
                    urlMatch = url.match(/.+\/(.+)\/[0-9]+\/(.+)\/[0-9]+\/(.+)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[3]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]
                        + ' from ' + newLog.language['log_' + urlMatch[1]]);
                    // break;
                } else if (url.includes('notes')) {
                    newLog.set('action', newLog.language['log_add']);
                    newLog.set('objectOfAction', newLog.language['log_notes'] + ' ' + newLog.language['log_general_relief_item']
                        + ' from ' + newLog.language['log_distributions']);
                    // break;
                } else if (url.includes('distributed')) {
                    newLog.set('action', newLog.language['log_distributed']);
                    newLog.set('objectOfAction', newLog.language['log_general_relief_item']
                        + ' from ' + newLog.language['log_distributions']);
                    // break;
                } else if (url.includes('add')) {
                    urlMatch = url.match(/.+\/(.+)\/[0-9]+\/(.+)\/(.+)/);
                    newLog.set('action', newLog.language['log_' + urlMatch[3]]);
                    newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]]
                    + ' to ' + newLog.language['log_' + urlMatch[1]]);
                    // break;
                }
                else {
                    newLog.set('action', newLog.language['log_edit']);
                    if (url.includes('update')) {
                        newLog.set('objectOfAction', newLog.language['log_booklets'] + newLog.language['log_password']);
                        // break;
                    } else if (url.includes('provider')) {
                        newLog.set('objectOfAction', newLog.language['log_provider']);
                        // break;
                    } else if (url.includes('upload')) {
                        urlMatch = url.match(/.+\/(.+)\/.+\/(.+)/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[2]] + ' of '
                            + newLog.language['log_' + urlMatch[1]]);
                        // break;
                    }
                    else {
                        urlMatch = url.match(/.+\/(.+)\/[0-9]+/);
                        newLog.set('objectOfAction', newLog.language['log_' + urlMatch[1]]);
                        // break;
                    }
                }
                // break;
            }
            return newLog;
        }
    }









            //     // FORGET ===================
            //     if (/\/deactivate-booklets/.test(url)) {
            //         newLog.set('action', 'deactivated');
            //         newLog.set('objectOfAction', 'booklets');
            //     } else {
            //         if (urlMatch) {
            //             newLog.set('action', 'edited');
            //             newLog.set('objectOfAction', newLog.language[urlMatch[0]]);
            //         } else {
            //             const actions = ['import', 'validate', 'remove', 'archive', 'complete',
            //             'notes', 'distributed', 'add', 'transaction', 'assign', 'scanned', 'delete', 'upload'];
            //             actions.forEach((word: string) => {
            //                 if (url.includes(word)) {
            //                     newLog.set('action', newLog.language['log_' + word]);
            //                 }
            //             });
            //         }
            //         if (url.includes('households')) {
            //             newLog.set('objectOfAction', 'households to a project');
            //         } else if (url.includes('distributions')) {
            //             if (url.includes('beneficiaries')) {
            //                 newLog.set('objectOfAction', 'a beneficiary in a distribution');
            //             } else if (url.includes('generalrelief')) {
            //                 newLog.set('objectOfAction', 'a general relief item in a distribution');
            //             } else {
            //                 newLog.set('objectOfAction', 'a distribution');
            //             }
            //         } else if (url.includes('projects')) {
            //             newLog.set('objectOfAction', 'beneficiaries to a project');
            //         } else if (url.includes('send')) {
            //             newLog.set('objectOfAction', 'a transaction');
            //         } else if (url.includes('email')) {
            //             newLog.set('objectOfAction', 'a transaction\'s code');
            //         } else if (url.includes('financial')) {
            //             newLog.set('objectOfAction', 'a third party connection');
            //         } else if (url.includes('users')) {
            //             newLog.set('objectOfAction', 'the language');
            //         } else if (url.includes('password')) {
            //             newLog.set('objectOfAction', 'the password');
            //         } else if (url.includes('assign')) {
            //             newLog.set('objectOfAction', 'a beneficiary in a distribution');
            //         } else if (url.includes('vendors')) {
            //             newLog.set('objectOfAction', 'a vendor');
            //         } else if (url.includes('products')) {
            //             newLog.set('objectOfAction', 'a product');
            //         } else if (url.includes('organization')) {
            //             newLog.set('objectOfAction', 'the organization');
            //         } else if (url.includes('donor')) {
            //             newLog.set('objectOfAction', 'a donor');
            //         } else if (url.includes('vouchers')) {
            //             newLog.set('objectOfAction', 'a voucher');
            //         }
            //     }
            //     break;
            // }

