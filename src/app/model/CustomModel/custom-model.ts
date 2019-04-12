import { GlobalText } from 'src/texts/global';

export abstract class CustomModel {

    static rights: Array<string>;
    title: string;

    // TODO: create interface for typing purpose
    abstract fields: any;

    public fillWithOptions() {
    }

    public modelToApi(): object {

        const mappedValues = {};

        Object.keys(this.fields).map((fieldName: string) => {
            mappedValues[fieldName] = this.fields[fieldName].formatForApi();
        });

        return mappedValues;
    }

    public getDateOffset(year: number, month: number, day: number) {
        const date = new Date();
        date.setFullYear(date.getFullYear() + year);
        date.setMonth(date.getMonth() + month);
        date.setDate(date.getDate() + day);
        return date;
    }

    public getIdentifyingName() {
        return GlobalText.TEXTS.this + ' ' + this.title;
    }

    public get<T = CustomModel>(field: string): T {
        return this.fields[field] ? this.fields[field].value : null;
    }

    public set(field: string, value: any) {
        if (this.fields[field]) {
            this.fields[field].value = value;
        }
    }

    public getOptions(field: string) {
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

    public isPrintable() {
        return false;
    }

    public isAssignable() {
        return false;
    }
}
