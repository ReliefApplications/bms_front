import { Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LanguageService } from './../../../../../texts/language.service';

@Component({
    selector: 'app-beneficiary-form',
    templateUrl: './beneficiary-form.component.html',
    styleUrls: [ './beneficiary-form.component.scss', '../update-beneficiary.component.scss' ]
})
export class BeneficiaryFormComponent implements OnInit {
    @Input() form: FormGroup;
    @Input() options: Object;

    // Language
    public language = this.languageService.selectedLanguage;

    constructor (
    private languageService: LanguageService,
    ) {}

    ngOnInit() {}
}
