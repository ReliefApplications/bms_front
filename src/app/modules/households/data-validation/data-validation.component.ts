import { Component, OnInit, HostListener } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { MatSnackBar } from '@angular/material';



@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    public check = false;
    public keep = true;
    public replace = false;
    public beneficiaries: Array<any> = [];
    public buttonUpdate = false;
    public conflictMerged: Array<number> = [];

    public createData: Array<any> = [];
    public updateData: Array<any> = [];
    public datas: Array<any> = [];

    constructor(
        public _importService: ImportService,
        public _householdsService: HouseholdsService,
        public snackBar: MatSnackBar
    ) {

    }

    ngOnInit(){
        this.getData();
    }

    getData() {
        this.datas = this._importService.getData();
        console.log("DATAS", this.datas);
    }


    saveBoth(data) {
        data.conflictMerged = true;
        data.new.households['project'] = this._importService.getProject();
        this._householdsService.addHouseholds(data.new.households).subscribe(response => {
            this.snackBar.open('Household created', '', {duration:500});
        });
        console.log("DATA NEW", data.new.households);

    }



}