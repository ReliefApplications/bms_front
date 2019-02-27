import { GlobalText } from '../../texts/global';

export class CountrySpecific {
    static __classname__ = 'CountrySpecific';
    /**
     * CountrySpecific's id
     * @type {number}
     */
    id: number;
    /**
     * CountrySpecific's name
     * @type {string}
     */
    name = '';
    /**
     * CountrySpecific's field
     * @type {string}
     */
    field = '';
    /**
     * CountrySpecific's type
     * @type {string}
     */
    type = '';
    /**
     * CountrySpecific's countryIso3
     * @type {string}
     */
    countryIso3 = '';
    field_string: any;

    constructor(instance?) {
        if (instance !== undefined) {
            this.id = instance.id;
            this.field = instance.field;
            this.type = instance.type;
            this.countryIso3 = instance.countryIso3;
            this.name = instance.name;
        }
    }

    public static getDisplayedName() {
        return GlobalText.TEXTS.model_country_specific;
    }

    /**
	* return CountrySpecific properties name displayed
	*/
    static translator(): Object {
        return {
            field: GlobalText.TEXTS.model_country_specific_field,
            type: GlobalText.TEXTS.model_type,
            countryIso3: GlobalText.TEXTS.model_countryIso3,
        };
    }

    public static formatArray(instance): CountrySpecific[] {
        const countrySpecific: CountrySpecific[] = [];
        if (instance) {
            instance.forEach(element => {
                countrySpecific.push(this.formatFromApiCountrySpecific(element));
            });
        }
        return countrySpecific;
    }

    public static formatFromApiCountrySpecific(element: any): CountrySpecific {
        const countrySpecific = new CountrySpecific();
        countrySpecific.id = element.id;
        countrySpecific.field = element.field_string ? element.field_string : '';
        countrySpecific.type = element.type ? element.type : '';
        countrySpecific.countryIso3 = element.countryIso3 ? element.countryIso3 : '';
        countrySpecific.name = element.field ? element.field : '';

        return countrySpecific;
    }

    public static formatForApi(element: CountrySpecific): any {
        return new CountrySpecific(element);
    }

    /**
	 * used in modal add
	 * @param element
	 * @param loadedData
	 */
    public static formatFromModalAdd(element: any, loadedData: any): CountrySpecific {
        const newObject = new CountrySpecific(element);

        return newObject;
    }

    mapAllProperties(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            id: selfinstance.id,
            field: selfinstance.field,
            type: selfinstance.type,
            countryIso3: selfinstance.countryIso3,
            name: selfinstance.name,
        };
    }

    /**
    * return a CountrySpecific after formatting its properties
    */
    getMapper(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            field: selfinstance.field,
            type: selfinstance.type,
        };
    }

    /**
    * return a CountrySpecific after formatting its properties for the modal details
    */
    getMapperDetails(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            field: selfinstance.field,
            type: selfinstance.type,
        };
    }

    /**
     * return a CountrySpecific after formatting its properties for the modal add
     */
    getMapperAdd(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            field: selfinstance.field,
            type: selfinstance.type,
        };
    }

    /**
    * return a CountrySpecific after formatting its properties for the modal update
    */
    getMapperUpdate(selfinstance): Object {
        if (!selfinstance) {
            return selfinstance;
        }

        return {
            field: selfinstance.field,
            type: selfinstance.type,
        };
    }

    /**
    * return the type of CountrySpecific properties
    */
    getTypeProperties(selfinstance): Object {
        return {
            field: 'text',
            type: 'text',
        };
    }

    /**
    * return the type of CountrySpecific properties for modals
    */
    getModalTypeProperties(selfinstance): Object {
        return {
            field: 'text',
            type: 'selectSingle',
        };
    }
}




export class CountrySpecificAnswer {
    static __classname__ = 'CountrySpecificAnswer';
    /**
     * Answer
     * @type { string}
     */
    answer = '';
    /**
     * @type {CountrySpecific}
     */
    country_specific: CountrySpecific;
}
