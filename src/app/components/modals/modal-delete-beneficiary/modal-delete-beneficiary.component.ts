import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LanguageService } from 'src/app/core/language/language.service';


@Component({
    selector: 'app-modal-delete-beneficiary',
    templateUrl: './modal-delete-beneficiary.component.html',
    styleUrls: ['../modal.component.scss', './modal-delete-beneficiary.component.scss']
})
export class ModalDeleteBeneficiaryComponent {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public modalReference: MatDialogRef<any>,
        public languageService: LanguageService,
        ) {
    }

    onDelete(): any {
        this.modalReference.close('DeleteBeneficiary');
    }

    onCancel() {
        this.modalReference.close('Cancel');
    }
}
