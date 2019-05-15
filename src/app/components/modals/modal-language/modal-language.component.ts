import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { UserService } from 'src/app/core/api/user.service';
import { Language } from 'src/app/core/language/language';
import { Arabic } from 'src/app/core/language/translations/language-arabic';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
@Component({
    selector: 'app-modal-language',
    templateUrl: './modal-language.component.html',
    styleUrls: ['../modal.component.scss', './modal-language.component.scss']
})
export class ModalLanguageComponent implements OnInit {
    public isCheckedDefault = false;
    public default = false;
    public isArabic = false;
    public languageForm: FormGroup;

    // Language
    public language: Language = this.languageService.selectedLanguage ?
        this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public dialogRef: MatDialogRef<ModalLanguageComponent>,
        public languageService: LanguageService,
        public userService: UserService,
        private snackbar: SnackbarService,
        private asyncacheService: AsyncacheService,
        ) {

    }

    ngOnInit() {
        this.makeControls();
        this.isArabic = this.language instanceof Arabic;
    }

    makeControls() {

        this.languageForm = new FormGroup(
            {
                languageControl: new FormControl(this.language, Validators.required),
                defaultControl: new FormControl(this.languageIsDefault(this.language))
            }
            );
    }

    updateDefault() {
        this.languageForm.patchValue(
            {
                defaultControl: this.languageIsDefault(this.languageForm.value.languageControl)
            }
        );
    }

    private languageIsDefault(language: Language) {

        const defaultLanguage = this.languageService.stringToLanguage(
            this.userService.currentUser.get<string>('language')
            );
        // TODO: language should be stored as a Language object and not a string in user
        return defaultLanguage.LANGUAGE_ISO ===  language.LANGUAGE_ISO;
    }

    save() {
        const newLanguage = this.languageForm.value.languageControl;
        if (this.languageForm.value.defaultControl) {
            this.userService.setDefaultLanguage(
                this.userService.currentUser.get<number>('id'),
                newLanguage
                ).subscribe((_response: any) => {
                    this.snackbar.success('Default Language Saved');
                    this.asyncacheService.setLanguage(newLanguage);
                    window.location.reload();
                }
            );
        } else {
            this.asyncacheService.setLanguage(newLanguage);
            window.location.reload();
        }
    }
}
