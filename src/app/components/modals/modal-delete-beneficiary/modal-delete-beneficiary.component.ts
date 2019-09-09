import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageService } from 'src/app/core/language/language.service';
import { FormControl, Validators } from '@angular/forms';


@Component({
    selector: 'app-modal-delete-beneficiary',
    templateUrl: './modal-delete-beneficiary.component.html',
    styleUrls: ['../modal.component.scss', './modal-delete-beneficiary.component.scss']
})
export class ModalDeleteBeneficiaryComponent {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    public justification = new FormControl('', [Validators.required]);

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public modalReference: MatDialogRef<any>,
        public languageService: LanguageService,
        ) {
    }

    onDelete(): any {
        this.modalReference.close({
            method: 'DeleteBeneficiary',
            justification: this.justification.value
        });
    }

    onCancel() {
        this.modalReference.close('Cancel');
    }
}
