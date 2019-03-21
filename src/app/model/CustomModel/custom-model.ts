export abstract class CustomModel {

    static rights: Array<string>;

    abstract fields: object;

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
}
