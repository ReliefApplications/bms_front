import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AddBeneficiaryService {

    public givenName: string;
    public familyName = '';
    public dateOfBirth = '';
    public nationalID = '';
    public livelihood = '';
    public phone = '';

    public vulnerabilities: number[] = [];
    public gender: string;
    public typePhone: string = '';
    public typeNationalID: string = '';

    public setVariable(variableName: string, variableValue) {
        switch (variableName) {
            case 'givenName':
                this.givenName = variableValue;
                break;
            case 'dateOfBirth':
                this.dateOfBirth = variableValue;
                break;
            case 'nationalID':
                this.nationalID = variableValue;
                break;
            case 'livelihood':
                this.livelihood = variableValue;
                break;
            case 'familyName':
                this.familyName = variableValue;
                break;
            case 'phone':
                this.phone = variableValue;
                break;
        }
    }

    addBeneficiaries(type: string) {
        let member = {};
        let fieldNationalID = {};
        let fieldPhones = {};
        let fieldVunerabilityCriteria = {};

        member['given_name'] = this.givenName;
        member['family_name'] = this.familyName;
        if (this.gender === "F") {
            member['gender'] = 0;
        }
        else {
            member['gender'] = 1;
        }
        let formatDateOfBirth = this.dateOfBirth.split('/');
        member['date_of_birth'] = formatDateOfBirth[2] + "-" + formatDateOfBirth[0] + "-" + formatDateOfBirth[1];
        member['updated_on'] = new Date();
        member['profile'] = {};
        member['profile']['photo'] = "";
        member['national_ids'] = [];
        member['phones'] = [];
        member['vulnerability_criteria'] = [];

        this.vulnerabilities.forEach(vulnerability => {
            fieldVunerabilityCriteria = {};
            fieldVunerabilityCriteria['id'] = vulnerability;
            member['vulnerability_criteria'].push(fieldVunerabilityCriteria);
        });

        if (this.phone != null) {
            if (this.typePhone != '') {
                fieldPhones['type'] = this.typePhone;
                fieldPhones['number'] = this.phone;
            }
            else {
                fieldPhones['type'] = 'type1';
                fieldPhones['number'] = this.phone;
            }
        } else {
            fieldPhones['type'] = null;
            fieldPhones['number'] = null;
        }
        member['phones'].push(fieldPhones);


        if (this.nationalID != null) {
            if (this.typeNationalID != '') {
                fieldNationalID['id_type'] = this.typeNationalID;
                fieldNationalID['id_number'] = this.nationalID;
            }
            else {
                fieldNationalID['id_type'] = 'card';
                fieldNationalID['id_number'] = this.nationalID;
            }
        } else {
            fieldNationalID['id_type'] = null;
            fieldNationalID['id_number'] = null;
        }
        member['national_ids'].push(fieldNationalID);

        if (type === 'head') {
            member['status'] = 1;
        } else {
            member['status'] = 0;
        }

        return member;
    }


    getlivelihood() {
        return this.livelihood;
    }

}

