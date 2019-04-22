import { GlobalText } from '../../texts/global';
import { isNumber } from '@swimlane/ngx-charts/release/utils';
import { isNull } from 'util';

import { DistributionBeneficiary } from './distribution-beneficiary.new';
import { ObjectModelField } from './CustomModel/object-model-field';
import { Beneficiary } from './beneficiary.new';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { DateModelField } from './CustomModel/date-model-field';
import { Phone } from './phone.new';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { CustomModel } from './CustomModel/custom-model';
import { NestedFieldModelField } from './CustomModel/nested-field';

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

    title = GlobalText.TEXTS.beneficiary;
    matSortActive = 'familyName';

    public fields = {
        idTransaction: new NumberModelField({
            title: GlobalText.TEXTS.transaction_id_transaction,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),
        beneficiary: new ObjectModelField<Beneficiary>(
            {
                value: []
            }
        ),
        givenName: new NestedFieldModelField({
            title: GlobalText.TEXTS.model_firstName,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'givenName',
            isDisplayedInModal: true,
        }),
        familyName: new NestedFieldModelField({
            title: GlobalText.TEXTS.model_familyName,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'familyName',
            isDisplayedInModal: true,
        }),
        phones: new NestedFieldModelField({
            title: GlobalText.TEXTS.phone,
            isDisplayedInTable: true,
            childrenObject: 'beneficiary',
            childrenFieldName: 'phones',
            isDisplayedInModal: true,
        }),
        // Status : -2. not sent / -1. no phone / 0. fail to send / 1.Successfully sent / 2. already sent / 3. picked up
        state: new SingleSelectModelField({
            title: GlobalText.TEXTS.model_state,
            options: [
                new State('-2', 'Not sent'),
                new State('-1', 'No phone'),
                new State('0', 'Sending failed'),
                new State('1', 'Sent'),
                new State('2', 'Already sent'),
                new State('3', 'Picked up')
            ],
            value: new State('-2', 'Not sent'),
            isDisplayedInTable: true,
            bindField: 'name',
            isDisplayedInModal: true,

        }),

        // Can only be filled by the distribution, in Distribution.apiToModel()
        values: new TextModelField({
            title: GlobalText.TEXTS.model_value,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
        }),

        // Can only be filled by the updateForPickup function
        pickupDate: new DateModelField({
            title: GlobalText.TEXTS.model_transaction_pickupDate,

        }),
        message: new TextModelField({
            title: GlobalText.TEXTS.model_transaction_message,
            isDisplayedInModal: true,
        }),
    };

    public static apiToModel(distributionBeneficiaryFromApi): TransactionMobileMoney {
        const newDistributionBeneficiary = new TransactionMobileMoney();
        newDistributionBeneficiary.set('beneficiary', Beneficiary.apiToModel(distributionBeneficiaryFromApi.beneficiary));
        const transactions = distributionBeneficiaryFromApi.transactions;

        if (transactions && transactions.length > 0 && isNumber(transactions[0].transaction_status)) {
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
        } else {
            newDistributionBeneficiary.updateState('-2');
        }
        return newDistributionBeneficiary;
    }


    public modelToApi(): Object {

        return {
            id: this.get('id'),
            givenName: this.get('beneficiary').get('givenName'),
            familyName: this.get('beneficiary').get('familyName'),
            phone: this.get('beneficiary').get<Phone[]>('phones').map(phone => phone.modelToApi())
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
            this.set('pickupDate', pickupState.date);
        }
    }

}
