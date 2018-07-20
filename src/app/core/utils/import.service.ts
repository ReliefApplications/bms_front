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

    /**
     * call the household service to send import and verification data
     * format response after receive it
     * 
     * @param data any
     * @param project step
     * @param step number
     * @param token string
     */
    sendData(data: any, project: string, step: number, token?: string) {
        return new Promise<any[]>((resolve, reject) => {
            this.data = [];
            this.referedClassService = this._householdsService
            //verifify if the token exist
            //token don't exist in the step 1 (sending the csv)
            if (!token) {
                this.referedClassToken = FormatDataNewOld;
                this.referedClassService.sendDataToValidation(data, project, step).subscribe(response => {

                    //use function to format and type data
                    let responseFormatted = this.referedClassToken.formatIssues(response.json(), step);
                    for (let i = 0; i < responseFormatted.length; i++) {
                        this.data.push(responseFormatted[i]);
                    }

                    this.token = response.json().token;
                    this.project = project;
                    resolve(this.data);
                }, error => {
                    reject({'message': 'Error while importing data'});
                });
            }
            else {
                if (step === 2) {
                    this.referedClassToken = FormatDuplicatesData;
                    this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {

                        //use function to format and type data
                        let responseFormatted = this.referedClassToken.formatDuplicates(response.json(), step);
                        for (let i = 0; i < responseFormatted.length; i++) {
                            this.data.push(responseFormatted[i]);
                        }
                        this.token = response.json().token;
                        this.project = project;
                        resolve(this.data);
                    }, error => {
                        reject({'message': 'Error while correcting typo issues'});
                    });
                } else if (step === 3 || step === 4) {
                    this.referedClassToken = FormatDataNewOld;
                    this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {

                        //use function to format and type data
                        let responseFormatted = this.referedClassToken.formatIssues(response.json(), step);
                        for (let i = 0; i < responseFormatted.length; i++) {
                            this.data.push(responseFormatted[i]);
                        }
                        this.token = response.json().token;
                        this.project = project;
                        resolve(this.data);
                    }, error => {
                        reject({'message': 'Error while adding or removing beneficiairies'});
                    });
                } else if (step === 5) {
                    this.referedClassService.sendDataToValidation(data, project, step, token).subscribe(response => {
                        if (response._body) {
                            resolve(this.data);
                        }
                    }, error => {
                        reject({'message': 'Error while adding all import data'});
                    });
                }


            }
        })

    }

    /**
     * use by dataValidationComponent to get data retrun by the back
     */
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