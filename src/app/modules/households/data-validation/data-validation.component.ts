import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar, MatStepper } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { VerifiedData } from '../../../model/data-validation';




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


    public check: boolean = true;
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
        if (this.step === 1) {
            this.typoIssues = this._importService.getData();
            console.log("typoIssues", this.typoIssues);
        }
         else if (this.step === 2) {
             this.duplicates = this._importService.getData();
             console.log("duplicates", this.duplicates);
         }
        
    }


    /**
     * Put corrected data in an array
     * @param data (data block with old and new object)
     * @param type (old or new to find out which object put in corrected data)
     * @param index 
     */
    selectCorrectedData(data, type, index, newHousehold?, idCache?) {
        console.log('data', data);
        console.log('new', newHousehold);
        console.log('cache', idCache);
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
     * used to send data to back with correction after every step
     * Data could be send only if all data is verify
     */
    sendCorrectedData() {
        let length = this.correctedData.length;
        this.correctedData.forEach(element => {
            if (!element.state && !element.new) {
                length = length - 1;
            }
        });
        if (this.typoIssues.length != length) {
            this.snackBar.open('All data aren\'t corrected', '', { duration: 500 });
        } else {
            this.step = this.step + 1;
            this._importService.sendData(this.correctedData, this._importService.getProject(), this.step, this._importService.getToken());
            this.snackBar.open('Typo issues corrected', '', { duration: 500 });
            this.stepper.next();
            this.getData();
            this.correctedData = [];
        }
    }
}