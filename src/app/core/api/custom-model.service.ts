import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';

export abstract class CustomModelService {
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

    // public delete(body: any) {
    //     return this.http.delete(this.makeUrl())
    // }

    private makeUrl(): string {
        return `${this.apiBase}/${this.customModelPath}`;
    }


}
