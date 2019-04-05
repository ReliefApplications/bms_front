import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Project } from 'src/app/model/project';
import { HouseholdsService } from '../api/households.service';


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    private email: string;
    // Token stored on file upload and reused for future steps
    private token: string;
    // Current project ( Todo: store it as Project object )
    private project: Project;

    private csvFile: File;

    constructor(
        private householdsService: HouseholdsService,
    ) {}

    setImportContext(email: string, project: Project, csvFile: File ) {
        this.email = email;
        this.project = project;
        this.csvFile = csvFile;
    }

    // Sends CSV to server and sets variables needed for the rest of the import session
    sendCsv() {
        this.token = undefined;
        const body = new FormData();
        body.append('file', this.csvFile);

        return this.sendStepUserData(body);
    }



    sendStepUserData(data: any) {
        return this.householdsService.sendDataToValidation(this.email, data, this.project.id, this.token).pipe(
            map((response: Response) => {
                this.token = response['token'];
                delete response['token'];
                return response;
            })
        );
    }


    // public data: any;
    // public project: string;
    // public token: string;
    // public referedClassToken;
    // public referedClassService;

    // constructor(
    //     public _householdsService: HouseholdsService
    // ) {

    // }

    // /**
    //  * call the household service to send import and verification data
    //  * format response after receive it
    //  *
    //  * @param data any
    //  * @param project step
    //  * @param step number
    //  * @param token string
    //  */
    // sendData(email: string, data: any, project: string, step: number, token?: string) {
    //     return new Promise<any[]>((resolve, reject) => {
    //         this.data = [];
    //         this.referedClassService = this._householdsService;
    //         // verifify if the token exist
    //         // token don't exist in the step 1 (sending the csv)
    //         if (!token) {
    //             this.referedClassToken = FormatDataNewOld;
    //             this.referedClassService.sendDataToValidation(email, data, project, step).subscribe(response => {

    //                 if (typeof response === 'string') {
    //                     reject({ 'message': response });
    //                 } else {
    //                     // use function to format and type data
    //                     const responseFormatted = this.referedClassToken.formatIssues(response, step);
    //                     for (let i = 0; i < responseFormatted.length; i++) {
    //                         this.data.push(responseFormatted[i]);
    //                     }
    //                     this.token = response.token;
    //                     this.project = project;
    //                     resolve(this.data);
    //                 }
    //             }, error => {
    //                 reject({ 'message': 'Error while importing data' });
    //             });
    //         } else {
    //             if (step === 2) {
    //                 // this.referedClassToken = FormatDuplicatesData;
    //                 this.referedClassToken = FormatDataNewOld;
    //                 this.referedClassService.sendDataToValidation(email, data, project, step, token).subscribe(response => {
    //                     // use function to format and type data
    //                     const responseFormatted = this.referedClassToken.formatIssues(response, step);
    //                     for (let i = 0; i < responseFormatted.length; i++) {
    //                         this.data.push(responseFormatted[i]);
    //                     }
    //                     this.token = response.token;
    //                     this.project = project;
    //                     resolve(this.data);
    //                 }, error => {
    //                     reject({ 'message': 'Error while correcting typo issues' });
    //                 });
    //             } else if (step === 3 || step === 4) {
    //                 this.referedClassToken = FormatDataNewOld;
    //                 this.referedClassService.sendDataToValidation(email, data, project, step, token).subscribe(response => {
    //                     // use function to format and type data
    //                     const responseFormatted = this.referedClassToken.formatIssues(response, step);
    //                     for (let i = 0; i < responseFormatted.length; i++) {
    //                         this.data.push(responseFormatted[i]);
    //                     }
    //                     this.token = response.token;
    //                     this.project = project;
    //                     resolve(this.data);
    //                 }, error => {
    //                     reject({ 'message': 'Error while adding or removing beneficiairies' });
    //                 });
    //             } else if (step === 5) {
    //                 this.referedClassService.sendDataToValidation(email, data, project, step, token).subscribe(response => {
    //                     resolve([this.data, response]);
    //                 }, error => {
    //                     reject();
    //                 });
    //             }


    //         }
    //     });

    // }

    // /**
    //  * Used by dataValidationComponent to get data returned by the back
    //  */
    // getData() {
    //     return this.data;
    // }

    // getProject() {
    //     return this.project;
    // }

    // getToken() {
    //     return this.token;
    // }

    // testFileTemplate(file: any, location: any) {
    //     return new Promise((resolve, reject) => {
    //         this.referedClassService = this._householdsService;

    //         this.referedClassService.testFileTemplate(file, location).subscribe(response => {
    //             if (typeof response === 'string') {
    //                 reject({ 'message': response });
    //             } else {
    //                 resolve(response);
    //             }
    //         }, error => {
    //             reject({ 'message': 'Error while testing data' });
    //         });
    //     });
    // }
}
