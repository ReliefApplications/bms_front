export abstract class AppObject {

    private fields: Object;

    public abstract apiToModel(): Object;
    public abstract modelToApi(object: Object): void;
    public abstract getDisplayedName(): Object;
}
