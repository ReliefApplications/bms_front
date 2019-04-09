import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { GlobalText } from '../../texts/global';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class Sector extends CustomModel {
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

    public static getDisplayedName() {
        return GlobalText.TEXTS.model_sector;
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
            'water sanitation': 'water_sanitation',
        };
        // Todo: Use global variable, fix typing in order to not do this if check
        if (typeof this.get('name') === 'string') {
            return `/assets/images/sectors/${sectorsImages[this.get<string>('name')]}.svg`;
        } else {
            return '';
        }
    }

    public getIdentifyingName() {
        return this.get<string>('name');
    }
}
