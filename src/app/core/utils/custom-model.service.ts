import { LanguageService } from 'src/app/core/language/language.service';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpService } from '../network/http.service';

export abstract class CustomModelService {
    readonly apiBase = URL_BMS_API;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    customModelPath: string;

    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
        ) {
    }

    protected setCustomModelPath(path: string) {
        this.customModelPath = path;
    }

    public get(filter?: any, sort?: any, pageIndex?: number, pageSize?: number) {
        return this.http.get(this.makeUrl());
    }

    public create(body: any) {
        return this.http.put(this.makeUrl(), body);
    }

    public update(id: number, body: any) {
        return this.http.post(`${this.makeUrl()}/${id}`, body);
    }

    public delete(id: number, parentId?: any, justification?: string) {
        return this.http.delete(`${this.makeUrl()}/${id}`);
    }

    protected makeUrl(): string {
        return `${this.apiBase}/${this.customModelPath}`;
    }

    public requestLogs(id: number) {
        const url = this.apiBase + this.customModelPath + id + '/logs';
        return this.http.get(url);
    }

    public fillFiltersWithOptions(filters: CustomModel) {

    }

    public fillWithOptions(object1?: Object, object2?: Object) {}
}
