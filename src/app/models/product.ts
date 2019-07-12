import { CustomModel } from './custom-models/custom-model';
import { FileModelField } from './custom-models/file-model-field';
import { NumberModelField } from './custom-models/number-model-field';
import { TextModelField } from './custom-models/text-model-field';

export class Product extends CustomModel {

    title = this.language.products;
    matSortActive = 'name';

    public fields = {
        id: new NumberModelField({

        }),
        name: new TextModelField({
            title: this.language.name,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isSettable: true,
            isRequired: true,
        }),
        unit: new TextModelField({
            title: this.language.unit,
            isDisplayedInModal: true,
            isDisplayedInTable: true,
            isSettable: true,
            isEditable: true,
            isRequired: true,
        }),
        image: new TextModelField({
            title: this.language.product_image,
            isDisplayedInTable: true,
            isImageInTable: true,
        }),
        imageData: new FileModelField({
            title: this.language.product_image,
            isDisplayedInModal: true,
            isSettable: true,
            uploadPath: '/products/upload/image',
            fileUrlField: 'image',
            isRequired: true,
            acceptedTypes: ['gif', 'jpg', 'jpeg', 'png'],
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

    public getImage(): string {
        return this.get<string>('image');
    }

    public getTooltip(): string {
        return this.get<string>('name');
    }

}
