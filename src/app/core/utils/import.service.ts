import { Injectable, Output, EventEmitter } from '@angular/core';
import { HouseholdsService } from '../api/households.service';
import { FormatDataNewOld, FormatDuplicatesData } from '../../model/data-validation';


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    public data;
    public project;
    public token;
    public referedClassToken;
    public referedClassService;


    constructor(
        public _householdsService: HouseholdsService
    ) {

    }

    sendData(data, project, step, token?) {
        this.data = [];
        this.referedClassService = this._householdsService
        if (!token) {
            this.referedClassToken = FormatDataNewOld;
            this.referedClassService.sendDataToValidation(data, project, step).subscribe(response => {
                
                let responseFormatted = this.referedClassToken.formatTypo(response.json());
                for (let i = 0; i < responseFormatted.length; i++) {
                    this.data.push(responseFormatted[i]);
                }
                this.token = response.json().token;
                this.project = project;
            });
        }
        else {
            this.referedClassToken = FormatDuplicatesData;
            this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {
                let responseFormatted = this.referedClassToken.formatDuplicates(response.json(), step);
                for (let i = 0; i < responseFormatted.length; i++) {
                    this.data.push(responseFormatted[i]);
                }
                this.token = response.json().token;
                this.project = project;
            });
            
        }
       
    }

    getData() {
        return this.data;
    }

    getProject() {
        return this.project;
    }

    getToken() {
        return this.token;
    }

}