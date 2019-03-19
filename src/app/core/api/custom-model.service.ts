import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';

export class CustomModelService {
    readonly apiBase = URL_BMS_API;
    customModelPath: string;

    constructor(protected http: HttpService) {
    }

    protected setCustomModelPath(path: string) {
        this.customModelPath = path;
    }

    public get() {
        return this.http.get(this.makeUrl());
    }

    public create(body: any) {
        return this.http.put(this.makeUrl(), body);
    }

    private makeUrl(): string {
        return `${this.apiBase}/${this.customModelPath}`;
    }

    public getOptions(customModel: CustomModel, field: string) {
        this.get().subscribe((options: string[]) => {
            customModel.fields[field].options = options;
        });
    }
}
