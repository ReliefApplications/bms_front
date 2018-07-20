import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar, MatStepper } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { VerifiedData, FormatDuplicatesData, FormatMore, FormatLess } from '../../../model/data-validation';





@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    @ViewChild('stepper') stepper: MatStepper;

    //variable to manage all issues
    public typoIssues: Array<any> = [];
    public duplicates: Array<any> = [];
    public more: Array<any> = [];
    public less: Array<any> = [];
    public correctedData: Array<any> = [];
    public step: number = 1;



    constructor(
        public _importService: ImportService,
        public _householdsService: HouseholdsService,
        public snackBar: MatSnackBar,
    ) {

    }

    ngOnInit() {
        this.getData();
    }


    /**
     * Get data which need verification and valisation after import csv
     */
    getData() {
        console.log('step', this.step)
        if (this.step === 1) {
            this.typoIssues = this._importService.getData();
            console.log("typoIssues", this.typoIssues);
        }
        else if (this.step === 2) {
            this.correctedData = [];
            this.duplicates = this._importService.getData();
            console.log("duplicates", this.duplicates);
            this.duplicates.forEach(duplicate => {
                duplicate.data.forEach(element => {
                    this.step2Duplicates(element, 'old', element.id_tmp_beneficiary, duplicate.new_household, duplicate.id_tmp_cache)
                })

            })
        } else if (this.step === 3) {
            this.correctedData = [];
            this.more = this._importService.getData();
            console.log('more', this.more);
            console.log('correct data length', this.correctedData.length);
        } else if (this.step === 4) {
            this.correctedData = [];
            this.less = this._importService.getData();
            console.log('less', this.less);
            console.log('correct data length', this.correctedData.length);
        } else if (this.step === 5) {
            console.log('aaaaaa')
        }


    }


    /**
     * Put corrected data in an array after verified typo issues
     * The array created in this function will be the array send to the back
     * 
     * @param data (data block with old and new object)
     * @param type (old or new to find out which object put in corrected data)
     * @param index 
     */
    step1TypoIssues(data, type, index) {
        let verification = new VerifiedData;
        let indexFound: boolean = false;

        this.correctedData.forEach(element => {
            if (element.index === index) {
                indexFound = true;
                if (type === 'old') {
                    element.state = !element.state;
                }
                else {
                    if (element.new) {
                        delete element.new;
                    }
                    else {
                        element.new = data.new.households;
                    }
                }
            }
        });
        if (indexFound === false) {
            if (type === 'old') {
                verification.id_old = data.old.households.id;
                verification.state = true;
                verification.index = index;
            }
            else if (type === 'new') {
                verification.new = data.new.households;
                verification.id_old = data.old.households.id;
                verification.index = index;
            }
            this.correctedData.push(verification);
        }
    }

    /**
     * Put corrected data in an array after verified duplicates
     * The array created in this function will be the array send to the back
     * @param data 
     * @param type 
     * @param index 
     * @param newHousehold 
     * @param idCache 
     */
    step2Duplicates(data, type, idDuplicate, newHousehold, idCache?) {
        console.log('idDuplicate', idDuplicate);
        let verification = new VerifiedData;
        let indexFound: boolean = false;
        let correctDuplicate = new FormatDuplicatesData;

        this.correctedData.forEach(duplicateVerified => {
            duplicateVerified.data.forEach(element => {
                if (element.id_duplicate === idDuplicate) {
                    indexFound = true;
                    if (type === 'old') {
                        element.state = !element.state;
                        if (element.state) {
                            element.to_delete = {};
                            element.to_delete.given_name = data.new.households.beneficiaries[0].given_name;
                            element.to_delete.family_name = data.new.households.beneficiaries[0].family_name;
                        }
                        else if (!element.state) {
                            delete element.to_delete;
                        }
                    }
                    else {
                        if (element.new) {
                            delete element.new;
                            element.to_delete = {};
                            element.to_delete.given_name = data.new.households.beneficiaries[0].given_name;
                            element.to_delete.family_name = data.new.households.beneficiaries[0].family_name;
                        }
                        else {
                            element.new = data.new.households;
                            delete element.to_delete;
                        }
                    }
                }
            });
        });
        if (indexFound === false) {
            if (type === 'old') {
                verification.id_old = data.old.households.id;
                verification.id_duplicate = idDuplicate;
                if (data.old.isHead) {
                    verification.state = true;
                    verification.to_delete = {};
                    verification.to_delete.given_name = data.new.households.beneficiaries[0].given_name;
                    verification.to_delete.family_name = data.new.households.beneficiaries[0].family_name;
                } else {
                    verification.state = false;
                }

            }
            else if (type === 'new') {
                verification.new = data.new.households;
                verification.id_old = data.old.households.id;
                verification.id_duplicate = idDuplicate;
            }

            let alreadyExist: boolean = false;

            if (idCache) {
                this.correctedData.forEach(element => {
                    if (element.id_tmp_cache === idCache) {
                        element.data.push(verification);
                        alreadyExist = true;
                    }
                });
            }

            if (!alreadyExist) {
                if (idCache) {
                    correctDuplicate.id_tmp_cache = idCache;
                }
                correctDuplicate.new_household = newHousehold
                correctDuplicate.data.push(verification);

                this.correctedData.push(correctDuplicate);
            }

        }
        console.log('corrected data', this.correctedData);
    }

    /**
     * 
     * @param beneficiary 
     * @param idOld 
     */
    step3More(beneficiary, idOld) {
        let beneficiaryToAdd = new FormatMore;
        let householdFind: boolean = false;
        let beneficiaryFind: boolean = false;
        if (this.correctedData.length != 0) {
            for (let j = 0; j < this.correctedData.length; j++) {
                if (this.correctedData[j].id_old === idOld) {
                    householdFind = true;
                    for (let i = 0; i < this.correctedData[j].data.length; i++) {
                        if (this.correctedData[j].data[i].id_tmp === beneficiary.id_tmp) {
                            this.correctedData[j].data.splice(beneficiary.id_tmp, 1);
                            beneficiaryFind = true;
                            break;
                        }
                    }
                    if (!beneficiaryFind) {
                        this.correctedData[j].data.push(beneficiary);
                    }

                   
                }
            }
            if (!householdFind) {
                beneficiaryToAdd.id_old = idOld;
                beneficiaryToAdd.data.push(beneficiary);
                this.correctedData.push(beneficiaryToAdd);
            }
        } else {
            beneficiaryToAdd.id_old = idOld;
            beneficiaryToAdd.data.push(beneficiary);
            this.correctedData.push(beneficiaryToAdd);
        }
    }

    /**
     * 
     * @param idBeneficiary 
     * @param idOld 
     */
    step4Less(idBeneficiary, idOld) {
        console.log('id benef', idBeneficiary);
        console.log('id HH', idOld);
        let beneficiaryToAdd = new FormatLess;
        let householdFind: boolean = false;
        let beneficiaryFind: boolean = false;
        if (this.correctedData.length != 0) {
            for (let j = 0; j < this.correctedData.length; j++) {
                if (this.correctedData[j].id_old === idOld) {
                    householdFind = true;
                    for (let i = 0; i < this.correctedData[j].data.length; i++) {
                        if (this.correctedData[j].data[i] === idBeneficiary) {
                            this.correctedData[j].data.splice(this.correctedData[j].data.indexOf(idBeneficiary), 1);
                            console.log('after remove', this.correctedData);
                            beneficiaryFind = true;
                            break;
                        }
                    }
                    if (!beneficiaryFind) {
                        this.correctedData[j].data.push(idBeneficiary);
                    }
                }
            }
            if (!householdFind) {
                beneficiaryToAdd.id_old = idOld;
                beneficiaryToAdd.data.push(idBeneficiary);
                this.correctedData.push(beneficiaryToAdd);
            }
        } else {
            beneficiaryToAdd.id_old = idOld;
            beneficiaryToAdd.data.push(idBeneficiary);
            this.correctedData.push(beneficiaryToAdd);
        }
        console.log('correct', this.correctedData);
    }

    /**
     * used to send data to back with correction after every step
     * Data could be send only if all data is verify
     */
    sendCorrectedData() {
        let length = this.correctedData.length;
        if (this.step === 1) {
            this.correctedData.forEach(element => {
                if (!element.state && !element.new) {
                    length = length - 1;
                }
            });
        } else if (this.step === 2) {
            this.correctedData.forEach(duplicateVerified => {
                duplicateVerified.data.forEach(element => {
                    if (!element.state && element.to_delete) {
                        length = length - 1;
                    }
                });

            });
        }
        if (this.step === 1 && this.typoIssues.length != length) {
            this.snackBar.open('All typo issues aren\'t corrected', '', { duration: 500 });
        } else if (this.step === 2 && this.duplicates.length != length) {
            this.snackBar.open('All duplicates aren\'t corrected', '', { duration: 500 });
        } else {

            if (this.step === 1) {
                this.snackBar.open('Typo issues corrected', '', { duration: 500 });
            } else if (this.step === 2) {
                this.snackBar.open('Duplicate issues corrected', '', { duration: 500 });
            } else if (this.step === 3) {
                this.snackBar.open('Beneficiaries added in household', '', { duration: 500 });
            } else if (this.step === 4) {
                this.snackBar.open('Beneficiaries removed in household', '', { duration: 500 });
            }
            this.step = this.step + 1;
            console.log('step', this.step);
            this._importService.sendData(this.correctedData, this._importService.getProject(), this.step, this._importService.getToken()).then(() => {
                this.stepper.next();
                this.getData();
            });

        }
    }
}