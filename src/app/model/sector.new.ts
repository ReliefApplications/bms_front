import { GlobalText } from '../../texts/global';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
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

        newSector.fields.id.value = sectorFromApi.id;
        newSector.fields.name.value = sectorFromApi.name;

        return newSector;
    }


    // Map sector to sector image
    public getImage(): string {

        const sectorsImages = {
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
        // Todo: Use global variable
        return `/assets/images/sectors/${sectorsImages[this.fields.name.value]}.svg`;
    }
}
