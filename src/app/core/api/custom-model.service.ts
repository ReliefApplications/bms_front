import { GlobalText } from 'src/texts/global';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpService } from './http.service';

export abstract class CustomModelService {
    readonly apiBase = URL_BMS_API;

    public texts = GlobalText.TEXTS;

    customModelPath: string;

    constructor(protected http: HttpService) {
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

    public delete(id: number, parentId?: any) {
        return this.http.delete(`${this.makeUrl()}/${id}`);
    }

    protected makeUrl(): string {
        return `${this.apiBase}/${this.customModelPath}`;
    }
}
