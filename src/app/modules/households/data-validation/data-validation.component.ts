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
        console.log("typo", this.typoIssues);
        // this.duplicate = this._importService.getDuplicates();
        // this.more = this._importService.getAddedBeneficiaries();
        // this.less = this._importService.getRemovedBeneficiaries();
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
                    element.state = !element.state;
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
                verification.state = true;
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
}