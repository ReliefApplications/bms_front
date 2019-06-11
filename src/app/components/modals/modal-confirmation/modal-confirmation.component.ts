import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { LanguageService } from 'src/app/core/language/language.service';

@Component({
    selector: 'app-modal-confirmation',
    templateUrl: './modal-confirmation.component.html',
    styleUrls: ['../modal.component.scss', './modal-confirmation.component.scss']
})
export class ModalConfirmationComponent implements OnInit {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogs: MatDialogRef<ModalConfirmationComponent>,
        public languageService: LanguageService,
    ) { }

    ngOnInit() {
    }

    accept() {
        // this.choice.emit('true');
        this.dialogs.close(true);
    }

    cancel() {
        // this.choice.emit('false');
        this.dialogs.close(false);
    }

}
