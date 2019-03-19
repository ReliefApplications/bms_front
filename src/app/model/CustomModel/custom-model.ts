export abstract class CustomModel {

    abstract fields: object;

    public abstract apiToModel(): object;

    public modelToApi(): object {

        const mappedValues = {};

        Object.keys(this.fields).map((fieldName: string) => {
            mappedValues[fieldName] = this.fields[fieldName].formatForApi();
        });

        return mappedValues;
    }
}
