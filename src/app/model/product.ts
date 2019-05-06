import { CustomModel } from './CustomModel/custom-model';
import { FileModelField } from './CustomModel/file-model-field';
import { NumberModelField } from './CustomModel/number-model-field';
import { TextModelField } from './CustomModel/text-model-field';

export class ErrorInterface {
    message: string;
}

export class Product extends CustomModel {

    public static rights = ['ROLE_ADMIN'];
    title = this.language.settings_product;
    matSortActive = 'name';

    public fields = {
        id: new NumberModelField({

        }),
        name: new TextModelField({
            title: this.language.model_product_name,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isSettable: true,
            isRequired: true,
        }),
        unit: new TextModelField({
            title: this.language.model_product_unit,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isSettable: true,
            isEditable: true,
            isRequired: true,
        }),
        image: new TextModelField({
            title: this.language.model_product_image,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        imageData: new FileModelField({
            title: this.language.model_product_image,
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

    public getIdentifyingName() {
        return this.get<string>('name');
    }

}
