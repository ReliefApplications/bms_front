import { CustomModel } from './custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { SingleSelectModelField } from './custom-models/single-select-model-field';
import { TextModelField } from './custom-models/text-model-field';

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

    public getTooltip(): string {
        const commoditiesTooltips: object = {
            'Cash': this.language.commodity_cash,
            'Voucher': this.language.voucher,
            'In Kind': this.language.commodity_in_kind,
            'Other': this.language.other,
        };
        // Todo: Use global variable, fix typing in order to not do this if check

        const modalityName = this.get('name');

        if (typeof modalityName === 'string') {
            return commoditiesTooltips[modalityName];
        } else {
            return '';
        }
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

    public getTooltip(): string {
        const commoditiesTooltips: object = {
            'Mobile Money': this.language.commodity_modality_cash,
            'QR Code Voucher': this.language.commodity_modality_qr_voucher,
            'Paper Voucher': this.language.commodity_modality_paper_voucher,
            'Bread': this.language.commodity_modality_bread,
            'Loan': this.language.commodity_modality_loan,
            'Food': this.language.commodity_modality_food,
            'WASH Kit': this.language.commodity_modality_wash,
            'Agricultural Kit': this.language.commodity_modality_agriculture,
            'RTE Kit': this.language.commodity_modality_rte,
            'Shelter tool kit': this.language.commodity_modality_shelter,
            'Hygiene kit': this.language.commodity_modality_hygiene,
            'Dignity kit': this.language.commodity_modality_dignity,
        };
        // Todo: Use global variable, fix typing in order to not do this if check

        const modalityName = this.get('name');

        if (typeof modalityName === 'string') {
            return commoditiesTooltips[modalityName];
        } else {
            return '';
        }
    }
}

export class Commodity extends CustomModel {
    title = this.language.commodity;
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
                title: this.language.commodity_modality,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                bindField: 'name',
                apiLabel: 'name',
                isTranslatable: true,
                // For options, same as sectors and donors
            }
        ),
        modalityType: new SingleSelectModelField(
            {
                title: this.language.type,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
                bindField: 'name',
                apiLabel: 'name',
                isTranslatable: true,
                // For options, depends on modality
            }
        ),
        unit: new TextModelField(
            {
                title: this.language.unit,
                placeholder: null,
                isSettable: true,
                isRequired: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isLongText: false,
                isEditable: true,
            }
        ),
        value: new NumberModelField(
            {
                title: this.language.commodity_value,
                placeholder: null,
                isRequired: true,
                isSettable: true,
                isDisplayedInModal: true,
                isDisplayedInTable: true,
                isEditable: true,
            }
        ),
        description: new TextModelField(
            {
                title: this.language.description,
                isLongText: true,
                isSettable: true,
                isDisplayedInTable: true,
            }
        )
    };

    public static apiToModel(commodityFromApi: any): Commodity {
        const newCommodity = new Commodity();

        newCommodity.set('id', commodityFromApi.id);
        newCommodity.set('modalityType', new ModalityType(commodityFromApi.modality_type.id, commodityFromApi.modality_type.name));
        const modalityName = commodityFromApi.modality_type.modality.name ?
            commodityFromApi.modality_type.modality.name :
            commodityFromApi.modality_type.modality;
        newCommodity.set('modality', new Modality(null, modalityName));
        newCommodity.set('value', commodityFromApi.value);
        newCommodity.set('unit', commodityFromApi.unit);
        newCommodity.set('description', commodityFromApi.description);

        return newCommodity;
    }

    public modelToApi(): Object {
        return {
            id: this.fields.id.formatForApi(),
            type: this.fields.modalityType.formatForApi(),
            unit: this.fields.unit.formatForApi(),
            value: this.fields.value.formatForApi(),
            modality: this.fields.modality.formatForApi(),
            description: this.get('description'),
            modality_type: {
                id: this.get('modalityType').get('id'),
                name:  this.get('modalityType').get('name'),
                modality: {name: this.get('modality').get('name')}
            },
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
            'Shelter tool kit': 'shelter',
            'Hygiene kit': 'hygiene',
            'Dignity kit': 'dignity',
        };
        // Todo: Use global variable, fix typing in order to not do this if check

        const modalityName = this.get('modalityType').get('name');

        if (typeof modalityName === 'string') {
            return `/assets/images/commodities/${commoditiesImages[modalityName]}.svg`;
        } else {
            return '';
        }
    }

    public getTooltip(): string {
        return this.get<ModalityType>('modalityType').getTooltip();
    }

    public getIdentifyingName() {
        return this.get('modality').get<string>('name');
    }
}
