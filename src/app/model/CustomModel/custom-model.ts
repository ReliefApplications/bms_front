export abstract class CustomModel {

    abstract fields: object;

    public abstract apiToModel(): object;
    public abstract modelToApi(object: object): void;
}
