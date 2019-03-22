import { GlobalText } from '../../texts/global';

export class ErrorInterface {
    message: string;
}

export class Product {
    static __classname__ = 'Product';
    /**
     * Product id
     * @type {string}
     */
    id = '';
    /**
     * Product name
     * @type {string}
     */
    name = '';
    /**
    * Product unit
    * @type {string}
    */
    unit = '';
    /**
    * Product image url
    * @type {string}
    */
    image = '';
    /**
    * Product image uploaded
    * @type {formData}
    */
    imageData;



    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
            this.unit = instance.unit;
            this.image = instance.image;
        }
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.settings_product;
    }

    /**
    * return User properties name displayed
    */
    static translator(): Object {
        return {
            name: GlobalText.TEXTS.model_product_name,
            unit: GlobalText.TEXTS.model_product_unit,
            image: GlobalText.TEXTS.model_product_image,
        };
    }

    public static formatArray(instance): Product[] {
        const product: Product[] = [];
        if (instance) {
            instance.forEach(element => {
                product.push(this.formatFromApi(element));
            });
        }
        return product;
    }

    public static formatFromApi(element: any): Product {
        return new Product(element);
    }

    public static formatForApi(element: Product): any {
        return new Product(element);
    }

    /**
     * Product in modal add
     * @param element
     * @param loadedData
     */
    public static formatFromModalAdd(element: any, loadedData: any): Product {
        return new Product(element);
    }

    /**
    * return the type of product properties
    */
    getTypeProperties(): Object {
        return {
            name: 'text',
            unit: 'text',
            image: 'document',
        };
    }

    /**
    * return a product after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return undefined;
        }
        return {
            name: selfinstance.name,
            unit: selfinstance.unit,
            image: selfinstance.image,
        };
    }

    /**
   * return a product after formatting its properties
   */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return undefined;
        }
        return {
            name: selfinstance.name,
            unit: selfinstance.unit,
            image: selfinstance.image,
        };
    }

    /**
     * return a User after formatting its properties for the modal add
     */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            name: selfinstance.name,
            unit: selfinstance.unit,
            image: selfinstance.image,
        };
    }

    /**
     * return a product after formatting its properties for the modal update
     */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return undefined;
        }
        return {
            name: selfinstance.name,
            unit: selfinstance.unit,
            image: selfinstance.image,
        };
    }

    /**
    * return the type of product properties for modals
    */
    getModalTypeProperties(): Object {
        return {
            name: 'text',
            unit: 'text',
            image: 'document',
        };
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return undefined;
        }
        return {
            id: selfinstance.id,
            name: selfinstance.name,
            unit: selfinstance.unit,
            image: selfinstance.image,
        };
    }
}
