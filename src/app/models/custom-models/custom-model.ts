import { LanguageService } from 'src/app/core/language/language.service';
import { AppInjector } from '../../app-injector';

export abstract class CustomModel {

    static rights: Array<string>;
    title: string;
    matSortActive: string;
    createMultiple = false;

    // TODO: create interface for typing purpose
    abstract fields: any;

    protected languageService = AppInjector.get(LanguageService);

    // Language
    protected language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    public static apiToModel(objectFromApi: any, otherInfo?: any): CustomModel {
        throw new Error('This is an abstract function, write your own');
    }

    public modelToApi(): object {

        const mappedValues = {};

        Object.keys(this.fields).map((fieldName: string) => {
            mappedValues[fieldName] = this.fields[fieldName].formatForApi();
        });

        return mappedValues;
    }

    public getDateOffset(year: number, month: number, day: number): Date {
        const date = new Date();
        date.setFullYear(date.getFullYear() + year);
        date.setMonth(date.getMonth() + month);
        date.setDate(date.getDate() + day);
        return date;
    }

    public getIdentifyingName(): string {
        return `${this.language.this} ${this.title}`;
    }

    public get<T = CustomModel>(field: string): T {
        return this.fields[field] ? this.fields[field].value : null;
    }

    public set(field: string, value: any): CustomModel {
        if (this.fields[field]) {
            this.fields[field].value = value;
        }
        return this;
    }

    public getOptions(field: string): CustomModel[] {
        return this.fields[field] ? this.fields[field].options : null;
    }

    public setOptions(field: string, value: any[]) {
        if (this.fields[field]) {
            this.fields[field].options = value;
        }
    }

    public add(field: string, value: any) {
        this.fields[field].value.push(value);
    }

    public isPrintable(): boolean {
        return false;
    }

    public isAssignable(): boolean {
        return false;
    }

    public isCheckable(): boolean {
        return true;
    }
}
