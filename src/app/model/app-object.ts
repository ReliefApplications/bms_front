export abstract class AppObject {

    public fields: object;

    public abstract apiToModel(): object;
    public abstract modelToApi(object: object): void;
    public abstract getDisplayedName(): object;
}
