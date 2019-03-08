export class AppObjectField {

    /**
     * Is the field displayed in modals?
     * @type {boolean}
     */
    isDisplayedInModals: boolean;
    /**
     * Is the field displayed in tables?
     * @type {boolean}
     */
    isDisplayedInTable: boolean;
    /**
     * Is the field a password?
     * @type {boolean}
     */
    isPassword: boolean;
    /**
     * Is the field required ?
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
     * @param  {Object} properties
     */
    constructor(properties: Object) {
        properties = AppObjectField.fillWithDefault(properties);

        this.isDisplayedInModals = properties['displayedInModals'];
        this.isDisplayedInTable = properties['displayedInTable'];
        this.isPassword = properties['password'];
        this.isRequired = properties['required'];
        this.isSettable = properties['settable'];
        this.isUpdatable = properties['updatable'];
    }

    static fillWithDefault(properties: Object) {
        return {
            isDisplayedInModals: false,
            isDisplayedInTable: false,
            isPassword: false,
            isRequired: false,
            isSettable: false,
            isUpdatable: false,
            ...properties,
        };
    }
}
