import { SectorMapper } from './sector-mapper';
import { GlobalText } from '../../texts/global';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { CustomModel } from './CustomModel/custom-model';

export class Modality extends CustomModel {

    public fields = {
        id: new TextModelField({}),
        name: new TextModelField({}),
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class ModalityType extends CustomModel {

    public fields = {
        id: new TextModelField({}),
        name: new TextModelField({}),
    };

    constructor(id: string, name: string) {
        super();
        this.set('id', id);
        this.set('name', name);
    }
}

export class Commodity extends CustomModel {
    title = GlobalText.TEXTS.model_commodity;
    matSortActive = 'modality';

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

        newCommodity.set('id', commodityFromApi.id);
        newCommodity.set('modalityType', new ModalityType(null, commodityFromApi.modality_type.name));
        newCommodity.set('modality', new Modality(null, commodityFromApi.modality_type.modality));
        newCommodity.set('value', commodityFromApi.value);
        newCommodity.set('unit', commodityFromApi.unit);

        return newCommodity;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            type: this.fields.modalityType.formatForApi(),
            unit: this.fields.unit.formatForApi(),
            value: this.fields.value.formatForApi(),
            modality: this.fields.modality.formatForApi(),
            modality_type: { id: this.get('modalityType').get('id') }
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

        const modalityName = this.get('modalityType').get('name');

        if (typeof modalityName === 'string') {
            return `/assets/images/commodities/${commoditiesImages[modalityName]}.png`;
        } else {
            return '';
        }
    }

    public getIdentifyingName() {
        return this.get('modality').get<string>('name');
    }
}
