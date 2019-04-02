import { SectorMapper } from './sector-mapper';
import { GlobalText } from '../../texts/global';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { CustomModel } from './CustomModel/custom-model';

// export class Modality {

//     public fields = {
//         name: new SingleSelectModelField({

//         })
//     }
// }


// export class ModalityType {

//     public fields = {
//         id : new NumberModelField(
//             {
//                 title: null,
//                 placeholder: null,
//                 isDisplayedInTable: false,
//                 isDisplayedInModal: false,
//             },
//         ),
//         name: new SingleSelectModelField({

//         }),
//         modality: new ObjectModelField<Modality>(
//             {

//             }
//         )
//     }
// }

export class Commodity extends CustomModel {
    title = GlobalText.TEXTS.model_commodity;

    public fields = {
        id : new NumberModelField(
            {
                title: null,
                placeholder: null,
                isDisplayedInTable: false,
                isDisplayedInModal: false,
            },
        ),
        modality: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.model_commodity_modality,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                bindField: 'name',
                apiLabel: 'name',
                // For options, same as sectors and donors
            }
        ),
        modalityType: new SingleSelectModelField(
            {
                title: GlobalText.TEXTS.model_type,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                bindField: 'name',
                apiLabel: 'name',
                // For options, depends on modality
            }
        ),
        unit: new TextModelField(
            {
                title: GlobalText.TEXTS.model_commodity_unit,
                placeholder: null,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isLongText: false,
                isEditable: true,
            }
        ),
        value: new NumberModelField(
            {
                title: GlobalText.TEXTS.model_commodity_value,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
            }
        ),
    };

    public static apiToModel(commodityFromApi: any): Commodity {
        const newCommodity = new Commodity();

        newCommodity.fields.id.value = commodityFromApi.id;
        newCommodity.fields.modalityType.value = { fields: { name: { value: commodityFromApi.modality_type.name }, id: { value: null}}};
        newCommodity.fields.modality.value = { fields: { name: { value: commodityFromApi.modality_type.modality }}};
        newCommodity.fields.value.value = commodityFromApi.value;
        newCommodity.fields.unit.value = commodityFromApi.unit;

        return newCommodity;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            type: this.fields.modalityType.formatForApi(),
            unit: this.fields.unit.formatForApi(),
            value: this.fields.value.formatForApi(),
            modality: this.fields.modality.formatForApi(),
            modality_type: { id: this.fields.modalityType.value.fields.id.value }
        };
    }

    // Map commodity to commodity image
    public getImage(): string {

        const commoditiesImages: object = {
            'Mobile Money': 'cash',
            'QR Code Voucher': 'voucher',
            'Paper Voucher': 'voucher',
            'Bread': 'bread',
            'Loan': 'loan',
            'Food': 'food',
            'WASH Kit': 'wash',
            'Agricultural Kit': 'agriculture',
            'RTE Kit': 'rte-kit',
        };
        // Todo: Use global variable, fix typing in order to not do this if check

        const modalityName = this.fields.modalityType.value.fields.name.value;

        if (typeof modalityName === 'string') {
            return `/assets/images/commodities/${commoditiesImages[modalityName]}.png`;
        } else {
            return '';
        }
    }

    public getIdentifyingName() {
        return this.fields.modality.value.fields.name.value;
    }
}
