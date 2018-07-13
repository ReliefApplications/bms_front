import { Component, OnInit, HostListener } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar } from '@angular/material';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';



@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    public datas: Array<any> = [];
    public check: boolean = true;
    public buttonUpdate: boolean = false;
    public conflictMerged: Array<number> = [];
    public dataToOverwrite: any = {};
    isDone: boolean = false;

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
     * Check if all verification is done to can go to the next step
     */
    verificationDone() {
        if (this.datas.length === this.dataToOverwrite.length) {
            this.isDone = true;
        }
    }

    selectHousehold(data, i) {
        
    }
    




















    /**
     * Save new Household and keep the old Household
     * @param data
     */
    saveBoth(data) {
        data.conflictMerged = true;
        this._householdsService.add(data.new.households, this._importService.getProject()).subscribe(response => {
            this.snackBar.open('Household created', '', { duration: 500 });
        });
    }

    /**
     * Triggers the possibility to update old Household
     * @param data 
     */
    overwrite(data) {
        data.update = true;
    }

    /**
     * Validate change and update old household in the database
     * @param data 
     */
    validateOverwriting(data) {
        //  data.conflictMerged = true;
         //get the id to old household to update it with newData
         let householdId = data.old.households.id;
         let newData;
        if (Object.keys(this.dataToOverwrite).length > 0 ) {
            newData = this.dataToOverwrite;
        }
        else {
           newData = data.old.households
        }
        console.log("newData", newData);
        // this._householdsService.update(this.dataToOverwrite, householdId, this._importService.getProject()).subscribe(response => {
        //     this.snackBar.open('Household updated', '', { duration: 500 });
        // });

    }

    /**
     * Select old or new households' data (name, adresse) to update old household in the database
     * @param data 
     * @param type 
     */
    selectData(data, type) {

        if (type === 'new') {
            this.dataToOverwrite = data.new.households;
        }
        else if (type === 'old') {
            this.dataToOverwrite = data.old.households;
        }
        console.log("TO OVERWRITE", this.dataToOverwrite, this.dataToOverwrite.length);
    }

    /**
     * Select or deselect beneficiaries to update old household
     * If there is new beneficary or if an old beneficiary don't be in this household anymore
     * @param beneficiary 
     */
    selectBeneficiary(beneficiary) {

    }



    

}