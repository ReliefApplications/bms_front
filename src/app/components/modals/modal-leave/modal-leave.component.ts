import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { LanguageService } from 'src/texts/language.service';

@Component({
    selector: 'app-modal-leave',
    templateUrl: './modal-leave.component.html',
    styleUrls: ['../modal.component.scss', './modal-leave.component.scss']
})
export class ModalLeaveComponent implements OnInit {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private dialogs: MatDialogRef<ModalLeaveComponent>,
        public languageService: LanguageService,
    ) { }

    ngOnInit() {
    }

    leave() {
        // this.choice.emit('true');
        this.dialogs.close(true);
    }

    cancel() {
        // this.choice.emit('false');
        this.dialogs.close(false);
    }

}
