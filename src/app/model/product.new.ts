import { GlobalText } from '../../texts/global';
import { NumberModelField } from './CustomModel/number-model-field';
import { SingleSelectModelField } from './CustomModel/single-select-model-field';
import { TextModelField } from './CustomModel/text-model-field';
import { FileModelField } from './CustomModel/file-model-field';
import { CustomModel } from './CustomModel/custom-model';

export class ErrorInterface {
    message: string;
}

export class Product extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = GlobalText.TEXTS.settings_product;
    matSortActive = 'name';

    public fields = {
        id: new NumberModelField({

        }),
        name: new TextModelField({
            title: GlobalText.TEXTS.model_product_name,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isSettable: true,
            isRequired: true,
        }),
        unit: new TextModelField({
            title: GlobalText.TEXTS.model_product_unit,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isSettable: true,
            isEditable: true,
            isRequired: true,
        }),
        image: new TextModelField({
            title: GlobalText.TEXTS.model_product_image,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        imageData: new FileModelField({
            title: GlobalText.TEXTS.model_product_image,
            isDisplayedInModal: true,
            isSettable: true,
            uploadPath: '/products/upload/image',
            fileUrlField: 'image',
            isRequired: true,
        })

    };

    public static apiToModel(productFromApi: any): Product {
        const newProduct = new Product();
        newProduct.set('id', productFromApi.id);
        newProduct.set('name', productFromApi.name);
        newProduct.set('unit', productFromApi.unit);
        newProduct.set('image', productFromApi.image);
        return newProduct;
    }

    public modelToApi(): Object {
        return {
            id: this.get('id'),
            name: this.get('name'),
            image: this.get('image'),
            unit: this.get('unit')
        };
    }


}
