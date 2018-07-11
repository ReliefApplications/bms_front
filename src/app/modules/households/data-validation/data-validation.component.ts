import { Component, OnInit, HostListener } from '@angular/core';
import { ImportService } from '../../../core/utils/import.service';



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

    public keepingData: Array<any> = [];
    public datas: Array<any> = [];

    constructor(
        public _importService: ImportService,
    ) {

    }

    ngOnInit(){
        this.getData();
    }


    getData() {
        this.datas = this._importService.getData();
        console.log("DATAS", this.datas);
    }

    // selectAll() {
    //     this.check = !this.check;
        
    // }

    // allChecked(e) {

    // }

    // selectRadioButton(e) {
    //     if(this.keep){
    //         this.keep = !this.keep
    //         this.replace = !this.replace;
    //     } else if (this.replace) {
    //         this.replace = !this.replace;
    //         this.keep = !this.keep
    //     }
    //     console.log("keep", this.keep);
    //     console.log("replace", this.replace);

    // }

    validate(element) { 
        // this.keepingData.push(element);
        console.log("keep", this.keepingData);
        console.log("ELEMENT", element, "BENEFICIARIES", this.beneficiaries);
        this.conflictMerged.push(element.id);
        console.log(this.conflictMerged);

    }

    update(): void {
        this.buttonUpdate = !this.buttonUpdate;
    }

    create(element): void {
        this.keepingData.push(element);
        console.log("DATA TO CREATE", element);
    }

    selectBeneficiary(event, data){
        console.log("BENEFICIARY", data);
        this.beneficiaries.push(data);


    }



}