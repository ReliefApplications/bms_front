import { Injectable, Output ,  EventEmitter } from '@angular/core';
import { HouseholdsService } from '../api/households.service';
import { DataValidation } from '../../model/data-validation';


@Injectable({
	providedIn: 'root'
})
export class ImportService{

    public dataFormat;
    referedClassToken = DataValidation;
    public referedClassService;


    constructor(
        public _householdsService: HouseholdsService
    ){

    }

    sendData(data){
        this.dataFormat = [];
        this.referedClassService = this._householdsService
        this.referedClassService.sendCSVToValidation(data).subscribe(response => {
        response = this.referedClassToken.formatArray(response.json());

            for(let i=0; i<response.length; i++){
                this.dataFormat.push(response[i]);
            }
 
        });
    }

    getData() {
        return this.dataFormat;
    }

}