import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LanguageService } from 'src/app/core/language/language.service';
import { FormControl, Validators } from '@angular/forms';
import { Beneficiary } from 'src/app/models/beneficiary';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';


@Component({
    selector: 'app-modal-add-beneficiary',
    templateUrl: './modal-add-beneficiary.component.html',
    styleUrls: ['../modal.component.scss', './modal-add-beneficiary.component.scss']
})
export class ModalAddBeneficiaryComponent implements OnInit {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    public justification = new FormControl('', [Validators.required]);
    beneficiaryList = new Array<Beneficiary>();
    selectedBeneficiariesControl = new FormControl([], [Validators.minLength(1), Validators.required]);

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public modalReference: MatDialogRef<any>,
        public languageService: LanguageService,
        public beneficiariesService: BeneficiariesService,
        public cacheService: AsyncacheService,
        ) {
    }

    ngOnInit() {
        this.getProjectBeneficiaries();
    }

    onAdd(): any {
        this.modalReference.close({
            method: 'AddBeneficiary',
            beneficiaries: this.selectedBeneficiariesControl.value,
            justification: this.justification.value
        });
    }

    onCancel() {
        this.modalReference.close('Cancel');
    }

        /**
     * Gets all the beneficiaries of the project to be able to add some to this distribution
     */
    getProjectBeneficiaries() {
        const target = this.data.distribution.get('type').get('name');

        this.beneficiariesService.getAllFromProject(this.data.distribution.get('project').get('id'), target)
            .subscribe(
                allBeneficiaries => {
                    if (allBeneficiaries) {
                        this.beneficiaryList = allBeneficiaries.map((beneficiary: any) => Beneficiary.apiToModel(beneficiary));
                    } else {
                        this.cacheService.get(
                            AsyncacheService.PROJECTS + '_' + this.data.distribution.get('project').get('id') + '_beneficiaries')
                            .subscribe(
                                beneficiaries => {
                                    if (beneficiaries) {
                                        this.beneficiaryList = beneficiaries.map((beneficiary: any) => Beneficiary.apiToModel(beneficiary));
                                    }
                                }
                            );
                    }
                }
            );
    }
}
