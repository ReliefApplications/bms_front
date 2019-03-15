import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModel } from 'src/app/model/custom-model';

export class CustomModelService {
    readonly apiBase = URL_BMS_API;
    customModelPath: string;

    constructor(protected http: HttpService) {
    }

    protected setCustomModelPath(path: string) {
        this.customModelPath = path;
    }

    public get() {
        const url = `${this.apiBase}/${this.customModelPath}`;
        return this.http.get(url);
    }

    public getOptions(customModel: CustomModel, field: string) {
        this.get().subscribe((options: string[]) => {
            customModel.fields[field].options = options;
        });
    }
}
