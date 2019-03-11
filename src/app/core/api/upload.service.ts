import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    readonly api = URL_BMS_API;

    constructor(private http: HttpService) {}

    uploadImage(file) {
        const url = this.api + '/uploadImage';
        return this.http.post(url, file);
    }
}
