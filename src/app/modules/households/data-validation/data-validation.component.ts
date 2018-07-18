import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar, MatStepper } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { VerifiedTypo } from '../../../model/data-validation';




@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    @ViewChild('stepper') stepper: MatStepper;

    //variable to manage all issues
    public datas: Array<any> = [];


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
        this.datas = this._importService.getData();
        console.log("DATAS", this.datas);
    }


    /**
     * Put corrected data in an array
     * @param data (data block with old and new object)
     * @param type (old or new to find out which object put in corrected data)
     * @param index 
     */
    selectHousehold(data, type, index) {
        let verification = new VerifiedTypo;
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
        console.log('correctData', this.correctedData);
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
        if (this.datas.length != length) {
            this.snackBar.open('All data aren\'t corrected', '', { duration: 500 });
        } else {
            this.step = this.step + 1;
            this._importService.sendData(this.correctedData, this._importService.getProject(), this.step, this._importService.getToken());
            this.snackBar.open('Typo issues corrected', '', { duration: 500 });
            this.stepper.next();
        }

        console.log("to send", this.correctedData);
    }
}