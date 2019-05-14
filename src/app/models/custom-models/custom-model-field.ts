import { AppInjector } from 'src/app/app-injector';
import { LanguageService } from 'src/app/core/language/language.service';

export class CustomModelField<T> {

    protected languageService = AppInjector.get(LanguageService);
    protected language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    /**
     * Described field
     * @type {T}
     */
    value: T ;
    /**
     * Is the field required?
     * @type {boolean}
     */
    title: string;
     /**
     * Field's type
     * @kindOfField {string}
     */
    kindOfField: string;
    /**
     * Is the field displayed in summaries?
     * @type {boolean}
     */
    isDisplayedInSummary: boolean;
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
     * Is the field displayed as an image in tables?
     * @type {boolean}
     */
    isImageInTable: boolean;
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
     * Can you edit the value of the field once the object is create?
     * @type {boolean}
     */
    isEditable: boolean;
    /**
     * What to display if the value is null/empty
     * @type {string}
     */
    nullValue: string;
    /**
     * What to display in the hint
     * @type {string}
     */
    hint: string;
    /**
     * What to display if there is a pattern error
     * @type {string}
     */
    patternError: string;
    /**
     * The pattern that must be respected by the field
     * @type {string}
     */
    pattern: string;
    /**
     * Does changing the value of the field triggers something ?
     * @type {boolean}
     */
    isTrigger: boolean;
    /**
     * The function triggered when changes are made
     * @type {Function}
     */
    triggerFunction: Function;
    /**
     * The name of the corresponding filter for the api
     * @type {string}
     */
    filterName: string;


    /**
     * @param  {Props} properties
     */
    constructor(properties: any) {
        properties = CustomModelField.fillWithDefault(properties);

        // Title displayed in the GUI
        this.title                  = properties['title'];

        // Object initial value
        this.value                  = properties['value'];

        // Boolean properties
        this.isDisplayedInModal     = properties['isDisplayedInModal'];
        this.isDisplayedInSummary   = properties['isDisplayedInSummary'];
        this.isDisplayedInTable     = properties['isDisplayedInTable'];
        this.isImageInTable         = properties['isImageInTable'];
        this.isRequired             = properties['isRequired'];
        this.isSettable             = properties['isSettable'];
        this.isEditable             = properties['isEditable'];
        this.nullValue              = properties['nullValue'];
        this.hint                   = properties['hint'];
        this.patternError           = properties['patternError'];
        this.pattern                = properties['pattern'];
        this.isTrigger              = properties['isTrigger'];
        this.triggerFunction        = properties['triggerFunction'];
        this.filterName             = properties['filterName'];
    }

    // Field specific value should never be omitted
    static fillWithDefault(properties: Object) {
        return {
            // Todo: set default title to null (used for debug purpose only)
            title:                  'TITLE NOT SET',

            value:                  null,

            isDisplayedInModal:     false,
            isDisplayedInSummary:   false,
            isDisplayedInTable:     false,
            isImageInTable:         false,
            isPassword:             false,
            isRequired:             false,
            isSettable:             false,
            isEditable:             false,
            nullValue:              'none',
            hint:                   null,
            patternError:                   null,
            pattern:                null,
            isTrigger:              false,
            filterName:             '',

            ...properties,
        };
    }

    formatForApi() {
        return this.value;
    }
}
