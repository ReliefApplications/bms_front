export abstract class AppObject {

    private fieldsInfo: Object;

    public abstract apiToModel(): Object;
    public abstract modelToApi(object: Object): void;
    public abstract getDisplayedName(): Object;
}
