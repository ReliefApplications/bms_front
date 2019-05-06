import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LanguageService } from './../../../../../texts/language.service';
import { Beneficiary } from 'src/app/model/beneficiary';
import { NationalId } from 'src/app/model/nationalId';
import { Phone } from 'src/app/model/phone';

@Component({
    selector: 'app-beneficiary-form',
    templateUrl: './beneficiary-form.component.html',
    styleUrls: [ './beneficiary-form.component.scss', '../update-beneficiary.component.scss' ]
})
export class BeneficiaryFormComponent implements OnInit {
    @Input() form: FormGroup;
    @Input() options: Object;

    // To have access to the fields of the Beneficiary, NationalId and Phone classes
    public beneficiaryFields = new Beneficiary().fields;
    public nationalIdFields = new NationalId().fields;
    public phoneFields = new Phone().fields;

    // Language
    public language = this.languageService.selectedLanguage;

    constructor (
    private languageService: LanguageService,
    ) {}

    ngOnInit() {}
}
