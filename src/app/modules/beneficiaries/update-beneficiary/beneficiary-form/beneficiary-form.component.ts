import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { Beneficiary, BeneficiaryOptions } from 'src/app/models/beneficiary';
import { NationalId } from 'src/app/models/national-id';
import { Phone } from 'src/app/models/phone';

@Component({
    selector: 'app-beneficiary-form',
    templateUrl: './beneficiary-form.component.html',
    styleUrls: [ './beneficiary-form.component.scss', '../update-beneficiary.component.scss' ]
})
export class BeneficiaryFormComponent implements OnInit {
    @Input() form: FormGroup;
    @Input() options: BeneficiaryOptions;

    // To have access to the fields of the Beneficiary, NationalId and Phone classes
    public beneficiaryFields = new Beneficiary().fields;
    public nationalIdFields = new NationalId().fields;
    public phoneFields = new Phone().fields;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor (
    public languageService: LanguageService,
    ) {}

    ngOnInit() {}
}
