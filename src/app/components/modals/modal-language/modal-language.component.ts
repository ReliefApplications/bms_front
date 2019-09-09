import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { Language } from 'src/app/core/language/language';
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
    public rtl = false;
    public languageForm: FormGroup;

    // Languageen
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
        this.rtl = this.language.direction === 'rtl';
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
            this.userService.setDefaultLanguage(this.userService.currentUser.get<number>('id'), newLanguage)
                .pipe(
                    switchMap((user: any) => {
                        this.snackbar.success(this.language.snackbar_saved_language);
                        return this.asyncacheService.setUser(user).pipe(
                            switchMap( _ => {
                                return this.changeLanguage(newLanguage);
                            })
                        );
                    })
            ).subscribe();
        } else {
            this.changeLanguage(newLanguage).subscribe();
        }
    }

    private changeLanguage(newLanguage: Language) {
        return this.asyncacheService.setLanguage(newLanguage).pipe(
            tap((_: any) => {
                window.location.reload();
            })
        );
    }
}
