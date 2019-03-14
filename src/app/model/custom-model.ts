export abstract class CustomModel {

    public fields: object;

    public abstract apiToModel(): object;
    public abstract modelToApi(object: object): void;
}
