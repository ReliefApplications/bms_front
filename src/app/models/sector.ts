import { Exception } from '@zxing/library';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';

export class Sector extends CustomModel {
    matSortActive = 'name';

    fields = {
        id: new NumberModelField(
            {
                title: null,
            }
        ),
        name: new TextModelField(
            {
                title: null,
            }
        )
    };

    // TODO: change this to instance method and fix it
    public static getDisplayedName() {
        throw new Exception();
        // return this.language.model_sector;
    }

    public static apiToModel(sectorFromApi): Sector {
        const newSector = new Sector();

        newSector.set('id', sectorFromApi.id);
        newSector.set('name', sectorFromApi.name);

        return newSector;
    }


    // Map sector to sector image
    public getImage(): string {

        const sectorsImages: object = {
            'camp coordination and management': 'cccm',
            'early recovery': 'early_recovery',
            'education': 'education',
            'emergency telecommunications': 'emergency_telecommunications',
            'food security': 'food_security',
            'health': 'health',
            'logistics': 'logistics',
            'nutrition': 'nutrition',
            'protection': 'protection',
            'shelter': 'shelter',
            'WASH': 'water_sanitation',
            'cash for work': 'cash_for_work',
            'TVET': 'tvet',
            'food, RTE kits': 'kits',
            'NFIs': 'nfi',
        };

        // Todo: Use global variable, fix typing in order to not do this if check
        if (typeof this.get('name') === 'string') {
            return `/assets/images/sectors/${sectorsImages[this.get<string>('name')]}.svg`;
        } else {
            return '';
        }
    }

    // Map sector to sector image
    public getTooltip(): string {

        const sectorsTooltips: object = {
            'camp coordination and management': this.language.sector_cccm,
            'early recovery': this.language.sector_recovery,
            'education': this.language.sector_education,
            'emergency telecommunications': this.language.sector_telecom,
            'food security': this.language.sector_food,
            'health': this.language.sector_health,
            'logistics': this.language.sector_logistics,
            'nutrition': this.language.sector_nutrition,
            'protection': this.language.sector_protection,
            'shelter': this.language.sector_shelter,
            'WASH': this.language.sector_water,
            'cash for work': this.language.sector_cash_for_work,
            'TVET': this.language.sector_tvet,
            'food, RTE kits': this.language.sector_food_kits,
            'NFIs': this.language.sector_nfi,
        };
        // Todo: Use global variable, fix typing in order to not do this if check
        if (typeof this.get('name') === 'string') {
            return sectorsTooltips[this.get<string>('name')];
        } else {
            return '';
        }
    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }
}
