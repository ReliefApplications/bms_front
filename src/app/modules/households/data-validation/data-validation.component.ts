import { Component, OnInit, HostListener } from '@angular/core';

@Component({
    selector: 'app-data-validation',
    templateUrl: './data-validation.component.html',
    styleUrls: ['./data-validation.component.scss']
})
export class DataValidationComponent implements OnInit {

    public selectedButton: string = "";
    ngOnInit(){

    }

    selectAll() {
        this.selectedButton = "selectAll";
        console.log(this.selectedButton);
    }

    validate() {
        this.selectedButton = "validate";
        console.log(this.selectedButton);
    }

    keepExisting() {
        this.selectedButton = "keepExisting";
        console.log(this.selectedButton);
    }

    replaceWithNew() {
        this.selectedButton = "replaceWithNew";
        console.log(this.selectedButton);
    }
}