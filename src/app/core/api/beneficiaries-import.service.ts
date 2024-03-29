import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Project } from 'src/app/models/project';
import { HouseholdsService } from './households.service';
import { Household } from 'src/app/models/household';


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    private email: string;
    // Token stored on file upload and reused for future steps
    private token: string;
    // Current project ( Todo: store it as Project object )
    public project: Project;

    private csvFile: File;

    private response: any;

    public importedHouseholds: Household[];

    constructor(
        private householdsService: HouseholdsService,
    ) {}

    // Sends CSV to server and sets variables needed for the rest of the import session
    sendCsv(csvFile: any, email: string, project: Project) {
        this.project = project;

        this.token = undefined;
        this.email = email;
        const body = new FormData();
        body.append('file', csvFile);

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
