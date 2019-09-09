import { CustomModel } from './custom-models/custom-model';
import { DateModelField } from './custom-models/date-model-field';
import { NestedFieldModelField } from './custom-models/nested-field';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';
import { DistributionBeneficiary } from './distribution-beneficiary';

export class State extends CustomModel {
    public fields = {
        name: new TextModelField({}),
        id: new TextModelField({})
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class TransactionMobileMoney extends DistributionBeneficiary {
    title = this.language.beneficiary;
    matSortActive = 'localFamilyName';

    public fields = {
        ...{
            // Duplicated because needs to be the first column
            beneficiaryId: new NestedFieldModelField({
                title: this.language.beneficiary_id,
                isDisplayedInTable: true,
                childrenObject: 'beneficiary',
                childrenFieldName: 'id'
            }),
            idTransaction: new NumberModelField({
                title: this.language.transaction_id_transaction,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
                nullValue: this.language.null_not_yet_defined,
            }),
            localGivenName: new NestedFieldModelField({
                title: this.language.beneficiary_given_name,
                isDisplayedInTable: true,
                childrenObject: 'beneficiary',
                childrenFieldName: 'localGivenName',
                isDisplayedInModal: true,
            }),
            localFamilyName: new NestedFieldModelField({
                title: this.language.beneficiary_family_name,
                isDisplayedInTable: true,
                childrenObject: 'beneficiary',
                childrenFieldName: 'localFamilyName',
                isDisplayedInModal: true,
            }),
            enGivenName: new NestedFieldModelField({
                title: this.language.beneficiary_en_given_name,
                isDisplayedInTable: false,
                childrenObject: 'beneficiary',
                childrenFieldName: 'enGivenName',
                isDisplayedInModal: false,
            }),
            enFamilyName: new NestedFieldModelField({
                title: this.language.beneficiary_en_family_name,
                isDisplayedInTable: false,
                childrenObject: 'beneficiary',
                childrenFieldName: 'enFamilyName',
                isDisplayedInModal: false,
            }),
            phones: new NestedFieldModelField({
                title: this.language.phone,
                isDisplayedInTable: true,
                childrenObject: 'beneficiary',
                childrenFieldName: 'phones',
                isDisplayedInModal: true,
            }),
            // Status : -2. not sent / -1. no phone / 0. fail to send / 1.Successfully sent / 2. already sent / 3. picked up
            state: new SingleSelectModelField({
                title: this.language.status,
                options: [
                    new State('-2', this.language.transaction_state_not_sent),
                    new State('-1', this.language.transaction_state_no_phone),
                    new State('0', this.language.transaction_state_sending_failed),
                    new State('1', this.language.transaction_state_sent),
                    new State('2', this.language.transaction_state_already_sent),
                    new State('3', this.language.transaction_state_picked_up)
                ],
                value: new State('-2', this.language.transaction_state_not_sent),
                isDisplayedInTable: true,
                bindField: 'name',
                apiLabel: 'id',
                isDisplayedInModal: true,

            }),

            // Can only be filled by the distribution, in Distribution.apiToModel()
            values: new TextModelField({
                title: this.language.value,
                isDisplayedInTable: true,
                isDisplayedInModal: true,
            }),

            // Can only be filled by the updateForPickup function
            pickupDate: new DateModelField({
                title: this.language.transaction_pickupDate,

            }),
            message: new TextModelField({
                title: this.language.transaction_message,
                isDisplayedInModal: true,
            }),
            addReferral: new NestedFieldModelField({
                title: this.language.beneficiary_referral_question,
                isDisplayedInModal: true,
                childrenObject: 'beneficiary',
                childrenFieldName: 'addReferral',
                isEditable: true,
            }),
            referralType: new NestedFieldModelField({
                title: this.language.beneficiary_referral_type,
                isDisplayedInModal: false,
                childrenObject: 'beneficiary',
                childrenFieldName: 'referralType',
                isEditable: true,
            }),
            referralComment: new NestedFieldModelField({
                title: this.language.beneficiary_referral_comment,
                isDisplayedInModal: false,
                childrenObject: 'beneficiary',
                childrenFieldName: 'referralComment',
                isEditable: true,
            }),
        }, ...this.fields
    };

    public static apiToModel(distributionBeneficiaryFromApi: any, distributionId: number): TransactionMobileMoney {
        const newDistributionBeneficiary = new TransactionMobileMoney();
        if (distributionBeneficiaryFromApi.beneficiary.referral) {
            newDistributionBeneficiary.fields.addReferral.isDisplayedInModal = false;
            newDistributionBeneficiary.fields.referralType.isDisplayedInModal = true;
            newDistributionBeneficiary.fields.referralComment.isDisplayedInModal = true;
        }
        const transactions = distributionBeneficiaryFromApi.transactions;

        if (transactions && transactions.length > 0 && Number.isInteger(transactions[0].transaction_status)) {
            newDistributionBeneficiary.set('idTransaction', transactions[0].id);
            const lastTransaction = transactions[transactions.length - 1];
            if (lastTransaction) {
                newDistributionBeneficiary.set('message', lastTransaction.message ? lastTransaction.message : '');
                if (lastTransaction.transaction_status === 0) {
                    newDistributionBeneficiary.updateState('0');
                } else if (lastTransaction.transaction_status === 1 && !lastTransaction.money_received) {
                    newDistributionBeneficiary.updateState('2');
                } else if (lastTransaction.transaction_status === 2) {
                    newDistributionBeneficiary.updateState('-1');
                } else if (lastTransaction.transaction_status === 1 && lastTransaction.money_received) {
                    newDistributionBeneficiary.updateState('3');
                } else {
                    newDistributionBeneficiary.updateState('-2');
                }
            }
        }
        // It means it comes from the cache, already "formatted"
        else if (distributionBeneficiaryFromApi.transaction_id) {
            newDistributionBeneficiary.set('idTransaction', distributionBeneficiaryFromApi.transaction_id);
            newDistributionBeneficiary.set('message', distributionBeneficiaryFromApi.message);
            newDistributionBeneficiary.updateState(distributionBeneficiaryFromApi.state);
        } else {
            newDistributionBeneficiary.updateState('-2');
        }
        this.addCommonFields(newDistributionBeneficiary, distributionBeneficiaryFromApi, distributionId);
        return newDistributionBeneficiary;
    }


    public modelToApi(): Object {

        return {
            id: this.fields.beneficiaryId.formatForApi(),
            beneficiary: this.fields.beneficiary.formatForApi(),
            transaction_id: this.fields.idTransaction.formatForApi(),
            message: this.fields.message.formatForApi(),
            state: this.fields.state.formatForApi()

            // localGivenName: this.get('beneficiary').get('localGivenName'),
            // localFamilyName: this.get('beneficiary').get('localFamilyName'),
            // phone: this.get('beneficiary').get<Phone[]>('phones').map(phone => phone.modelToApi())
        };

    }

    public updateState(stateId: string) {

        const state: State = this.getOptions('state')
            .filter((option: State) => option.get<string>('id') === stateId)[0];
        this.set('state', state);
    }

    updateForPickup(pickupState) {
        if (pickupState.moneyReceived) {
            this.updateState('3');
            this.set('pickupDate', DateModelField.formatFromApi(pickupState.date));
        }
    }

}
