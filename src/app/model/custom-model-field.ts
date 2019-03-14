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
     * Is the field hidden?
     * @type {boolean}
     */
    isHidden: boolean;
    /**
     * Is the field required?
     * @type {boolean}
     */
    /**
     * Can you select multiple elements of this field among other options?
     * @type {boolean}
     */
    isMultipleSelect: boolean;
    /**
     * Is the field a password?
     * @type {boolean}
     */
    isPassword: boolean;
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
     * Can you select only one element of this field among other options?
     * @type {boolean}
     */
    isSingleSelect: boolean;
    /**
     * Can you update the value of the field once the object is create?
     * @type {boolean}
     */
    isUpdatable: boolean;
    /**
     * Label displayed in select options
     * @type {string}
     */
    optionLabel: string;
    /**
     * List of options if the field should be a select
     * @type {string[]}
     */
    selectOptions: string[];
    /**
     * The path for the api
     * @type {string}
     */
    urlPath: string;

    /**
     * @typedef {Object} Props
     * @property {boolean} isDisplayedInModals
     */

    /**
     * @param  {Props} properties
     */
    constructor(properties: object) {
        properties = CustomModelField.fillWithDefault(properties);

        // Title displayed in the GUI
        this.title                  = properties['title'];

        // Object value
        this.value                  = properties['value'];

        // Boolean properties
        this.isDisplayedInModals    = properties['displayedInModals'];
        this.isDisplayedInTable     = properties['displayedInTable'];
        this.isHidden               = properties['isHidden'];
        this.isMultipleSelect       = properties['isMultipleSelect'];
        this.isPassword             = properties['password'];
        this.isRequired             = properties['required'];
        this.isSettable             = properties['settable'];
        this.isSingleSelect         = properties['isSingleSelect'];
        this.isUpdatable            = properties['updatable'];


        this.optionLabel            = properties['optionLabel'];
        this.selectOptions          = properties['selectOptions'];
        this.urlPath                = properties['urlPath'];

    }

    static fillWithDefault(properties: Object) {
        return {
            title: 'TITLE NOT SET',

            type: null,

            isDisplayedInModals: false,
            isDisplayedInTable: false,
            isHidden: false,
            isMultipleSelect: false,
            isPassword: false,
            isRequired: false,
            isSettable: false,
            isSingleSelect: false,
            isUpdatable: false,

            optionLabel: null,
            selectOptions: null,
            urlPath: null,
            ...properties,
        };
    }
}
