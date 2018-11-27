import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar, MatStepper } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { VerifiedData, FormatDuplicatesData, FormatMore, FormatLess } from '../../../model/data-validation';
import { GlobalText } from '../../../../texts/global';
import { Router } from '@angular/router';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Households } from 'src/app/model/households';
import { ImportedDataService } from 'src/app/core/utils/imported-data.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    @ViewChild('stepper') stepper: MatStepper;

    public nameComponent = "data_verification_title";
    public verification = GlobalText.TEXTS;

    //variable to manage all issues and display it
    public typoIssues: Array<any> = [];
    public duplicates: Array<any> = [];
    public more: Array<any> = [];
    public less: Array<any> = [];

    //array to fill with correct data
    public correctedData: Array<any> = [];

    //indicate the step in process
    public step: number = 1;

    //boolean to prevent user to go in next step if this step isn't complete
    public typoDone = false;
    public duplicateDone = false;
    public moreDone = false;
    public lessDone = false;
    public load: boolean = false;

    public newHouseholds: any = {};

    constructor(
        public _importService: ImportService,
        public _householdsService: HouseholdsService,
        public snackBar: MatSnackBar,
        private _cacheService: AsyncacheService,
        private router: Router,
        private importedDataService: ImportedDataService,
    ) {

    }

    ngOnInit() {
        let voters;
        this._cacheService.get('user').subscribe(
            result => {
                voters = result.voters;
                if (voters != "ROLE_ADMIN" && voters != 'ROLE_PROJECT_MANAGER' && voters != "ROLE_PROJECT_OFFICER") {
                    this.snackBar.open(this.verification.forbidden_message, '', { duration: 5000, horizontalPosition: 'center' });
                    this.router.navigate(['']);
                }
                else {
                    this.getData();
                }
            }
        );
    }

    /**
    * check if the langage has changed
    */
    ngDoCheck() {
        if (this.verification != GlobalText.TEXTS) {
            this.verification = GlobalText.TEXTS;
        }
    }


    /**
     * Get data which need verification and validation after import csv
     */
    getData() {
        this.load = false;
        if (this.step === 1) {
            this.typoIssues = this._importService.getData();
        }
        else if (this.step === 2) {
            this.correctedData = [];
            this.duplicates = this._importService.getData();
            //to add household in correctedData array when the old duplicates is the head of one household
            this.duplicates.forEach(duplicate => {
                duplicate.data.forEach(element => {
                    this.step2Duplicates(element, 'old', element.id_tmp_beneficiary, duplicate.new_household, duplicate.id_tmp_cache)
                })
            });
        }
        else if (this.step === 3) {
            this.correctedData = [];
            this.more = this._importService.getData();
        }
        else if (this.step === 4) {
            this.correctedData = [];
            this.less = this._importService.getData();
        } else if (this.step === 5) {
            this.step = 1;
        }
    }


    /**
     * Put corrected data in an array after verified typo issues
     * The array created in this function will be the array send to the back
     * 
     * @param data any
     * @param type string (old or new )
     * @param index number
     */
    step1TypoIssues(data: any, type: string, index: number) {
        let verification = new VerifiedData;
        let indexFound: boolean = false;
        this.correctedData.forEach(element => {
            //Search the index in the correctedData
            //if index found, update directly this object
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
        //if index not found create new object and insert it in correctedData
        if (indexFound === false) {
            if (type === 'old') {
                verification.id_old = data.old.households.id;
                verification.state = true;
                verification.index = index;
                verification.id_tmp_cache = data.id_tmp_cache;
            }
            else if (type === 'new') {
                verification.new = data.new.households;
                verification.id_old = data.old.households.id;
                verification.index = index;
                verification.id_tmp_cache = data.id_tmp_cache;
            }
            this.correctedData.push(verification);
        }
    }

    /**
     * Put corrected data in an array after verified duplicates
     * The array created in this function will be the array send to the back
     * 
     * @param data any
     * @param type string (old or new)
     * @param idDuplicate string
     * @param newHousehold any
     * @param idCache number
     */
    step2Duplicates(data: any, type: string, idDuplicate: string, newHousehold: any, idCache?: number) {
        let verification = new VerifiedData;
        let indexFound = false;
        let correctDuplicate = new FormatDuplicatesData;

        this.correctedData.forEach(duplicateVerified => {
            duplicateVerified.data.forEach(element => {
                // search if the duplicate id is already in correctedData
                // if duplicate id found, associate object update directly this object
                if (element.id_duplicate === idDuplicate) {
                    indexFound = true;
                    if (type === 'old') {
                        element.state = !element.state;
                        // when state is true, add an object to_delete containing name of new object
                        if (element.state) {
                            element.to_delete = {};
                            element.to_delete.given_name = data.new.households.beneficiaries[0].given_name;
                            element.to_delete.family_name = data.new.households.beneficiaries[0].family_name;
                        }
                        // when state is false, delete object to_delete
                        else if (!element.state) {
                            delete element.to_delete;
                        }
                    } else {
                        // when new already exist, delete it
                        // if new exist, it means checkbox is already check and we want unchecked it
                        if (element.new) {
                            delete element.new;
                            element.to_delete = {};
                            element.to_delete.given_name = data.new.households.beneficiaries[0].given_name;
                            element.to_delete.family_name = data.new.households.beneficiaries[0].family_name;
                        }
                        // when new don't exist, create it
                        // if new don't exist, it means it don't check and we want check it
                        else {
                            element.new = data.new.households;
                            delete element.to_delete;
                        }
                    }
                }
            });
        });
        // if duplicate isn't found in correctedData, create object and insert it in correctedData
        if (indexFound === false) {
            if (type === 'old') {
                verification.id_old = data.old.households.id;
                verification.id_duplicate = idDuplicate;
                // verify if the old duplicate is the head
                // if it's a head, state is true, object is create and checkbox is check and disabled in html
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

            // before add it in corrected data, we verified if the id_cache exist in correctedData
            let alreadyExist = false;
            if (idCache) {
                this.correctedData.forEach(element => {
                    // if id_cache already exist, update directly this element
                    if (element.id_tmp_cache === idCache) {
                        element.data.push(verification);
                        alreadyExist = true;
                    }
                });
            }

            // if id_cache don't exist, create new object in correctedData
            if (!alreadyExist) {
                if (idCache) {
                    correctDuplicate.id_tmp_cache = idCache;
                }
                correctDuplicate.new_household = newHousehold
                correctDuplicate.data.push(verification);

                this.correctedData.push(correctDuplicate);
            }
        }
    }

    /**
     * Put corrected data in an array after verified if there is more beneficiaries
     * The array created in this function will be the array send to the back
     * @param beneficiary any
     * @param idOld number
     */
    step3More(beneficiary: any, idOld: number) {
        let beneficiaryToAdd = new FormatMore;
        let householdFind = false;
        let beneficiaryFind = false;

        // check if a action has already made 
        if (this.correctedData.length != 0) {
            for (let j = 0; j < this.correctedData.length; j++) {
                // check if the household has already register in correctData
                if (this.correctedData[j].id_old === idOld) {
                    householdFind = true;
                    // if the household exist, search beneficiary
                    for (let i = 0; i < this.correctedData[j].data.length; i++) {
                        // if beneficiary exist, it means it already check and we want to unchecked it so remove it
                        if (this.correctedData[j].data[i].id_tmp === beneficiary.id_tmp) {
                            this.correctedData[j].data.splice(this.correctedData[j].data.indexOf(beneficiary.id_tmp), 1);
                            beneficiaryFind = true;
                            break;
                        }
                    }
                    // if it doesn't exist, it means it unchecked and we want to checked it, so create it
                    if (!beneficiaryFind) {
                        this.correctedData[j].data.push(beneficiary);
                    }
                }
            }
            // if the household doesn't find create it
            if (!householdFind) {
                beneficiaryToAdd.id_old = idOld;
                beneficiaryToAdd.id_tmp_cache = beneficiary.id_tmp_cache;
                beneficiaryToAdd.data.push(beneficiary);
                this.correctedData.push(beneficiaryToAdd);
            }
        } else {
            // if correctedData contains 0 data, add directly FormatMore object
            beneficiaryToAdd.id_old = idOld;
            beneficiaryToAdd.id_tmp_cache = beneficiary.id_tmp_cache;
            beneficiaryToAdd.data.push(beneficiary);
            this.correctedData.push(beneficiaryToAdd);
        }
    }

    /**
     * Put corrected data in an array after verified if there is less beneficiaries
     * The array created in this function will be the array send to the back
     * 
     * @param idBeneficiary number
     * @param idOld number
     */
    step4Less(idBeneficiary: number, idOld: number, idCache: number) {
        let beneficiaryToAdd = new FormatLess;
        let householdFind = false;
        let beneficiaryFind = false;
        let idToSend: any = {};
        idToSend.id = idBeneficiary;

        // check if a action has already made
        if (this.correctedData.length != 0) {
            for (let j = 0; j < this.correctedData.length; j++) {
                // check if the household has already register in correctData
                if (this.correctedData[j].id_old === idOld) {
                    householdFind = true;
                    // if the household exist, search beneficiary
                    for (let i = 0; i < this.correctedData[j].data.length; i++) {
                        // if beneficiary exist, it means it already check and we want to unchecked it so remove it
                        if (this.correctedData[j].data[i].id === idBeneficiary) {
                            this.correctedData[j].data.splice(this.correctedData[j].data.indexOf(idBeneficiary), 1);
                            beneficiaryFind = true;
                            break;
                        }
                    }
                    // if it doesn't exist, it means it unchecked and we want to checked it, so create it
                    if (!beneficiaryFind) {
                        this.correctedData[j].data.push(idToSend);
                    }
                }
            }
            // if the household doesn't find create it
            if (!householdFind) {
                beneficiaryToAdd.id_old = idOld;
                beneficiaryToAdd.id_tmp_cache = idCache;
                beneficiaryToAdd.data.push(idToSend);
                this.correctedData.push(beneficiaryToAdd);
            }
        } else {
            // if correctedData contains 0 data, add directly FormatMore object
            beneficiaryToAdd.id_old = idOld;
            beneficiaryToAdd.id_tmp_cache = idCache;
            beneficiaryToAdd.data.push(idToSend);
            this.correctedData.push(beneficiaryToAdd);
        }
    }

    /**
     * used to send data to back with correction after every step
     * Data could be send only if all data is verify
     */
    sendCorrectedData() {
        // verification for the step 1 and 2
        // the length of correctedData need to be equal of the length of data receive by the back
        // if the length isn't equal all data isn't corrected and it's impossible to go in the next step
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
            this.snackBar.open(this.verification.data_verification_snackbar_typo_no_corrected, '', { duration: 5000, horizontalPosition: 'center' });
        } else if (this.step === 2 && this.duplicates.length != length) {
            this.snackBar.open(this.verification.data_verification_snackbar_duplicate_no_corrected, '', { duration: 5000, horizontalPosition: 'center' });
        } else {
            this.load = true;
            if (this.step === 1) {
                this.snackBar.open(this.verification.data_verification_snackbar_typo_corrected, '', { duration: 5000, horizontalPosition: 'center' });
                this.typoDone = true;
            } else if (this.step === 2) {
                this.snackBar.open(this.verification.data_verification_snackbar_duplicate_corrected, '', { duration: 5000, horizontalPosition: 'center' });
                this.duplicateDone = true;
            } else if (this.step === 3) {
                this.snackBar.open(this.verification.data_verification_snackbar_more_corrected, '', { duration: 5000, horizontalPosition: 'center' });
                this.moreDone = true;
            } else if (this.step === 4) {
                this.snackBar.open(this.verification.data_verification_snackbar_more_corrected, '', { duration: 5000, horizontalPosition: 'center' });
                this.lessDone = true;
            }
            this.step = this.step + 1;
            this._importService.sendData(this.correctedData, this._importService.getProject(), this.step, this._importService.getToken()).then(() => {
                this.stepper.next();
                this.getData();
            }, () => {
                this.load = false;
                this.snackBar.open(this.verification.data_verification_error, '', { duration: 5000, horizontalPosition: 'center' });
            });

        }
    }

    addBeneficiaries() {
        this.cachedHouseholds();
    }

    cachedHouseholds() {
        this._householdsService.getCachedHouseholds()
            .subscribe(
                response => {
                    this.newHouseholds = response;
                    this.newHouseholds = Households.formatArray(this.newHouseholds);
                    this.importedDataService.data = this.newHouseholds;
                    this.router.navigate(['/beneficiaries/imported/data']);
                }
            );
    }
}
