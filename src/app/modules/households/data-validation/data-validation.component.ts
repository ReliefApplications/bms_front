import { Component, OnInit, HostListener } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { VerifiedData } from '../../../model/data-validation';




@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    //variable to manage all issues
    public typoIssues: Array<any> = [];
    public duplicate: Array<any> = [];
    public more: Array<any> = [];
    public less: Array<any> = [];


    public check: boolean = true;
    public correctedData: Array<any> = [];

    //boolean to know if a step is completed
    public typoDone: boolean = false;
    public duplicateDone: boolean = false;
    public moreDone: boolean = false;
    public lessDone: boolean = false;

    public

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
        this.typoIssues = this._importService.getTypoIssues();
        this.duplicate = this._importService.getDuplicates();
        this.more = this._importService.getAddedBeneficiaries();
        this.less = this._importService.getRemovedBeneficiaries();
    }

    /**
     * Check if all verification is done to can go to the next step
     */
    verificationDone() {
        // if (this.datas.length === this.correctedData.length) {
        //     this.isDone = true;
        // }
    }


    /**
     * Put corrected data in an array
     * @param data (data block with old and new object)
     * @param type (old or new to find out which object put in corrected data)
     * @param index 
     */
    selectHousehold(data, type, index) {
        let verification = new VerifiedData;
        let indexFound: boolean = false;
        this.correctedData.forEach(element => {
            if (element.index === index) {
                indexFound = true;
                if (type === 'old') {
                    element.old = !element.old;
                }
                else {
                    if (element.new) {
                        delete element.new;
                    }
                    else {
                        element.new = data.new;

                    }
                }
            }
        });
        if (indexFound === false) {
            if (type === 'old') {
                verification.idHousehold = data.old.households.id;
                verification.old = true;
                verification.index = index;
            }
            else if (type === 'new') {
                verification.new = data.new;
                verification.idHousehold = data.old.households.id;
                verification.index = index;
            }
            this.correctedData.push(verification);
        }
    }





















    /**
     * Save new Household and keep the old Household
     * @param data
     */
    // saveBoth(data) {
    //     data.conflictMerged = true;
    //     this._householdsService.add(data.new.households, this._importService.getProject()).subscribe(response => {
    //         this.snackBar.open('Household created', '', { duration: 500 });
    //     });
    // }

    /**
     * Triggers the possibility to update old Household
     * @param data 
     */
    // overwrite(data) {
    //     data.update = true;
    // }

    /**
     * Validate change and update old household in the database
     * @param data 
     */
    // validateOverwriting(data) {
    //  data.conflictMerged = true;
    //get the id to old household to update it with newData
    //  let householdId = data.old.households.id;
    //  let newData;
    // if (Object.keys(this.correctedData).length > 0 ) {
    //     newData = this.correctedData;
    // }
    // else {
    //    newData = data.old.households
    // }
    // console.log("newData", newData);
    // this._householdsService.update(this.correctedData, householdId, this._importService.getProject()).subscribe(response => {
    //     this.snackBar.open('Household updated', '', { duration: 500 });
    // });

    // }

    /**
     * Select old or new households' data (name, adresse) to update old household in the database
     * @param data 
     * @param type 
     */
    // selectData(data, type) {

    //     if (type === 'new') {
    //         this.correctedData = data.new.households;
    //     }
    //     else if (type === 'old') {
    //         this.correctedData = data.old.households;
    //     }
    //     console.log("TO OVERWRITE", this.correctedData, this.correctedData.length);
    // }

    /**
     * Select or deselect beneficiaries to update old household
     * If there is new beneficary or if an old beneficiary don't be in this household anymore
     * @param beneficiary 
     */
    // selectBeneficiary(beneficiary) {

    // }





}