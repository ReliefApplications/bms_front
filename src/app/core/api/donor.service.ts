import { Injectable } from '@angular/core';
import { Donor } from '../../model/donor.new';
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


    public fillWithOptions (donor: Donor) {

    }
}
