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


    public datas: Array<any> = [];
    public check: boolean = true;
    public buttonUpdate: boolean = false;
    public conflictMerged: Array<number> = [];
    public DataToOverwrite;

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
        this._householdsService.add(data.new.households, this._importService.getProject()).subscribe(response => {
            this.snackBar.open('Household created', '', {duration:500});
        });
        console.log("DATA NEW", data.new.households);

    }

    overwrite(data) {
        data.update = true;
        console.log("DATE UPDATE", data, data.update);
    }

    validateOverwriting(data) {
        data.conflictMerged = true;
        this._householdsService.update(this.DataToOverwrite, this.DataToOverwrite.id, this._importService.getProject()).subscribe(response => {
            this.snackBar.open('Household updated', '', {duration:500});
        });
        console.log("DATA  OVERWRITNG", this.DataToOverwrite);
    }

    selectData(data, type){
        if(type === 'new'){
            data.new.households['id'] = data.old.households.id;
            this.DataToOverwrite = data.new.households;
        }
        else if (type === 'old'){
            this.DataToOverwrite = data.old.households;
        }
        
        console.log("TO OVERWRITE", this.DataToOverwrite);
    }



}