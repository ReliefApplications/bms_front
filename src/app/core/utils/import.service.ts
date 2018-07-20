import { Injectable, Output, EventEmitter } from '@angular/core';
import { HouseholdsService } from '../api/households.service';
import { FormatDataNewOld, FormatDuplicatesData } from '../../model/data-validation';
import { promise } from 'protractor';


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    public data;
    public project;
    public token;
    public referedClassToken;
    public referedClassService;
    public test;


    constructor(
        public _householdsService: HouseholdsService
    ) {

    }

    sendData(data, project, step, token?) {
        console.log('import');
        return new Promise<any[]>((resolve, reject) => {
            this.data = [];
            this.referedClassService = this._householdsService
            if (!token) {
                this.referedClassToken = FormatDataNewOld;
                this.referedClassService.sendDataToValidation(data, project, step).subscribe(response => {

                    let responseFormatted = this.referedClassToken.formatIssues(response.json(), step);
                    for (let i = 0; i < responseFormatted.length; i++) {
                        this.data.push(responseFormatted[i]);
                    }
                    this.token = response.json().token;
                    this.project = project;
                    resolve(this.data);
                }, error => {
                    reject();
                });
            }
            else {
                if (step === 2) {
                    this.referedClassToken = FormatDuplicatesData;
                    this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {
                        let responseFormatted = this.referedClassToken.formatDuplicates(response.json(), step);
                        for (let i = 0; i < responseFormatted.length; i++) {
                            this.data.push(responseFormatted[i]);
                        }
                        this.token = response.json().token;
                        this.project = project;
                        resolve(this.data);
                    }, error => {
                        reject();
                    });
                } else if (step === 3 || step === 4) {
                    this.referedClassToken = FormatDataNewOld;
                    this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {

                        let responseFormatted = this.referedClassToken.formatIssues(response.json(), step);
                        for (let i = 0; i < responseFormatted.length; i++) {
                            this.data.push(responseFormatted[i]);
                        }
                        this.token = response.json().token;
                        this.project = project;
                        resolve(this.data);
                    }, error => {
                        reject();
                    });
                } else if (step === 5) {
                    this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {

                       console.log('fini',response);
                        resolve(this.data);
                    }, error => {
                        reject();
                    });
                }


            }
        })

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