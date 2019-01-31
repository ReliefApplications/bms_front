import { GlobalText } from "../../texts/global";

export class ErrorInterface {
    message: string;
}

export class Product {
    static __classname__ = 'Product';
    /**
     * Product id
     * @type {string}
     */
    id: string = '';
    /**
     * Product name
     * @type {string}
     */
    name: string = '';
    /**
    * Product code
    * @type {string}
    */
    code: string = '';



    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.name = instance.name;
            this.code = instance.code;
        }
    }

    /**
    * return User properties name displayed
    */
    static translator(): Object {
        return {
            name: GlobalText.TEXTS.model_product_name,
            code: GlobalText.TEXTS.model_product_code,
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
        const product = new Product(element);

        return product;
    }

    /**
    * return the type of product properties
    */
    getTypeProperties(): Object {
        return {
            name: "text",
            code: "text",
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
            code: selfinstance.code,
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
            code: selfinstance.code,
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
            code: selfinstance.code,
        };
    }

    /**
    * return the type of product properties for modals
    */
    getModalTypeProperties(): Object {
        return {
            name: "text",
            code: "text",
        };
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return undefined;
        }
        return {
            name: selfinstance.name,
            code: selfinstance.code,
        };
    }

    public static formatForApi(element: Product): any {
        return new Product(element);
    }
}