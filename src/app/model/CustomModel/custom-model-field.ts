export class CustomModelField<T> {
    /**
     * Described field
     * @type {T}
     */
    value: T;
    /**
     * Is the field required?
     * @type {boolean}
     */
    title: string;
     /**
     * Field's type
     * @type {string}
     */
    type: string;
    /**
     * Is the field displayed in modals?
     * @type {boolean}
     */
    isDisplayedInModal: boolean;
    /**
     * Is the field displayed in tables?
     * @type {boolean}
     */
    isDisplayedInTable: boolean;
    /**
     * Is the field required?
     * @type {boolean}
     */
    isRequired: boolean;
    /**
     * Can you set the value of the field on creation?
     * @type {boolean}
     */
    isSettable: boolean;
    /**
     * Can you update the value of the field once the object is create?
     * @type {boolean}
     */
    isUpdatable: boolean;

    /**
     * @param  {Props} properties
     */
    constructor(properties: any) {
        properties = CustomModelField.fillWithDefault(properties);

        // Title displayed in the GUI
        this.title                  = properties['title'];

        // Object value
        this.value                  = properties['value'];

        // Boolean properties
        this.isDisplayedInModal     = properties['isDisplayedInModal'];
        this.isDisplayedInTable     = properties['isDisplayedInTable'];
        this.isRequired             = properties['isRequired'];
        this.isSettable             = properties['isSettable'];
        this.isUpdatable            = properties['isUpdatable'];
    }

    // Field specific value should never be omitted
    static fillWithDefault(properties: Object) {
        return {
            // Todo: set default title to null (used for debug purpose only)
            title:                  'TITLE NOT SET',

            value:                  null,

            isDisplayedInModal:     false,
            isDisplayedInTable:     false,
            isPassword:             false,
            isRequired:             false,
            isSettable:             false,
            isUpdatable:            false,

            ...properties,
        };
    }
}
