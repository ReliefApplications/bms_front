import { TextModelField } from './CustomModel/text-model-field';
import { CustomModel } from './CustomModel/custom-model';

export class Profile extends CustomModel {
    public fields = {
        photo: new TextModelField(
            {
                value: ''
            }
        )
    };

    public static apiToModel(profileFromApi): Profile {
        const newProfile = new Profile();
        newProfile.fields.photo.value = profileFromApi.photo;
        return newProfile;
    }

    public modelToApi(): Object {
        return {
            photo: this.fields.photo.value
        };
    }
}
