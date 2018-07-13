import { Injectable, Output, EventEmitter } from '@angular/core';
import { HouseholdsService } from '../api/households.service';
import { DataValidation } from '../../model/data-validation';


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    public dataTypo;
    public dataDuplicate;
    public dataMore;
    public dataLess;
    public project;
    referedClassToken = DataValidation;
    public referedClassService;


    constructor(
        public _householdsService: HouseholdsService
    ) {

    }

    sendData(data, project) {
        this.dataTypo = [];
        this.dataDuplicate = [];
        this.dataMore = [];
        this.dataLess = [];
        this.referedClassService = this._householdsService
        this.referedClassService.sendCSVToValidation(data, project).subscribe(response => {
            console.log(response.json());

            let responseTypo = this.referedClassToken.formatArray(response.json().typo);
            for (let i = 0; i < responseTypo.length; i++) {
                this.dataTypo.push(responseTypo[i]);
            }

            let responseDuplicate = this.referedClassToken.formatArray(response.json().duplicate);
            for (let i = 0; i < responseDuplicate.length; i++) {
                this.dataDuplicate.push(responseDuplicate[i]);
            }

            let responseMoreBeneficiaries = this.referedClassToken.formatArray(response.json().more);
            for (let i = 0; i < responseMoreBeneficiaries.length; i++) {
                this.dataMore.push(responseMoreBeneficiaries[i]);
            }

            let responseLessBeneficiaries = this.referedClassToken.formatArray(response.json().less);
            for (let i = 0; i < responseLessBeneficiaries.length; i++) {
                this.dataLess.push(responseLessBeneficiaries[i]);
            }
            this.project = project;
        });
    }

    getTypoIssues() {
        return this.dataTypo;
    }

    getDuplicates() {
        return this.dataDuplicate;
    }
    getAddedBeneficiaries() {
        return this.dataMore;
    }
    getRemovedBeneficiaries() {
        return this.dataLess;
    }

    getProject() {
        return this.project;
    }

}