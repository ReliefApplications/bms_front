import { Injectable, OnInit } from '@angular/core';
import { CustomModelService } from './custom-model.service';
import { HttpService } from './http.service';



@Injectable({
    providedIn: 'root'
})
export class DonorService extends CustomModelService {

    customModelPath = 'donors';

        constructor(protected http: HttpService) {
            super(http);
        }


    // public update(id: number, body: any) {
    //     const url = this.api + '/donors/' + id;
    //     return this.http.post(url, body);
    // }

    // public create(id: number, body: any) {
    //     const url = this.api + '/donors';
    //     return this.http.put(url, body);
    // }

    // public delete(id: number) {
    //     const url = this.api + '/donors/' + id;
    //     return this.http.delete(url);
    // }
}
