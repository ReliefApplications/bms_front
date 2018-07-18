import { Injectable, Output, EventEmitter } from '@angular/core';
import { HouseholdsService } from '../api/households.service';
import { DataToValidate } from '../../model/data-validation';


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    public data;
    public project;
    public token;
    referedClassToken = DataToValidate;
    public referedClassService;


    constructor(
        public _householdsService: HouseholdsService
    ) {

    }

    sendData(data, project, step, token?) {
        this.data = [];
        this.referedClassService = this._householdsService
        if (!token) {
            this.referedClassService.sendDataToValidation(data, project, step).subscribe(response => {
                let responseFormatted = this.referedClassToken.formatArray(response.json(), step);
                for (let i = 0; i < responseFormatted.length; i++) {
                    this.data.push(responseFormatted[i]);
                }
                this.token = response.json().token;
                this.project = project;
            });
        }
        else {
            this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {
                console.log('token', response.json().token );
                console.log('step', step);
                // let responseFormatted = this.referedClassToken.formatArray(response.json(), step);
                // for (let i = 0; i < responseFormatted.length; i++) {
                //     this.data.push(responseFormatted[i]);
                // }
                this.token = response.json().token;
                this.project = project;
            });
            
        }
       

            // let responseDuplicate = this.referedClassToken.formatArray(response.json().duplicate);
            // for (let i = 0; i < responseDuplicate.length; i++) {
            //     this.dataDuplicate.push(responseDuplicate[i]);
            // }

            // let responseMoreBeneficiaries = this.referedClassToken.formatArray(response.json().more);
            // for (let i = 0; i < responseMoreBeneficiaries.length; i++) {
            //     this.dataMore.push(responseMoreBeneficiaries[i]);
            // }

            // let responseLessBeneficiaries = this.referedClassToken.formatArray(response.json().less);
            // for (let i = 0; i < responseLessBeneficiaries.length; i++) {
            //     this.dataLess.push(responseLessBeneficiaries[i]);
            // }
       
    }

    getData() {
        return this.data;
    }

    // getDuplicates() {
    //     return this.dataDuplicate;
    // }
    // getAddedBeneficiaries() {
    //     return this.dataMore;
    // }
    // getRemovedBeneficiaries() {
    //     return this.dataLess;
    // }

    getProject() {
        return this.project;
    }

    getToken() {
        return this.token;
    }

}