import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Project } from 'src/app/model/project.new';
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

    private response: any;

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
        return this.householdsService.sendDataToValidation(this.email, data, this.project.get('id'), this.token).pipe(
            map((response: Response) => {
                this.token = response['token'];
                delete response['token'];
                return response;
            })
        );
    }

    // Getter and setter to pass response from beneficiaries-import component to data-validation
    getResponse() {
        return this.response;
    }

    setResponse(response: any) {
        this.response = response;
    }
}
