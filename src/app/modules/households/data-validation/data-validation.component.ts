import { Component, OnInit, HostListener } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';

@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    public check = false;

    public keepingData: Array<any> = [];
    public datas: Array<any> = [];

    constructor(
        public _importService: ImportService
    ) {

    }

    ngOnInit(){
        this.getData();
    }

    getData() {
        this.datas = this._importService.getData();
        console.log("DATAS", this.datas);
    }

    selectAll() {
        this.check = !this.check;
    }

    allChecked(e) {
        console.log(e);

    }

    validate() { 

    }

    keepExisting() {
    }

    replaceWithNew() {
    }
}