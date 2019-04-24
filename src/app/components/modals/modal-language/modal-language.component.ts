import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Arabic } from 'src/texts/global_ar';
import { ModalComponent } from '../modal.component';
import { Language } from './../../../../texts/language';
import { User } from './../../../model/user.new';

@Component({
    selector: 'app-modal-language',
    templateUrl: './modal-language.component.html',
    styleUrls: ['../modal.component.scss', './modal-language.component.scss']
})
export class ModalLanguageComponent extends ModalComponent implements OnInit {
    public isCheckedDefault = false;
    public actualUser: User;
    public default = false;
    public isArabic = false;
    public form: FormGroup;



    ngOnInit() {
        this.languageSubscription = this.languageService.languageSource.subscribe((language: Language) => {
            this.language = language;
        });
        this.makeControls();
        this.isArabic = this.language instanceof Arabic;
    }

    makeControls() {

        this.form = new FormGroup(
            {
                languageControl: new FormControl('', Validators.required),
                defaultControl: new FormControl(this.currentLanguageIsDefault())
            }
        );
    }

    updateDefault() {
        this.form.patchValue(
            {
                defaultControl: this.currentLanguageIsDefault(),
            }
        );
        console.log(this.form);
    }

    private currentLanguageIsDefault() {

        const defaultLanguage = this.languageService.stringToLanguage(
            this.userService.currentUser.get<string>('language')
            );
        // TODO: language should be stored as a Language object and not a string in user
        return defaultLanguage.LANGUAGE_ISO ===  this.language.LANGUAGE_ISO;
    }


    // save() {
    //     this.languageService.changeLanguage();
    //     this.isArabic = this.language instanceof Arabic;
    //     if (this.isCheckedDefault) {
    //         this.userService.setDefaultLanguage(this.actualUser.get('id'), this.language).subscribe(response => {
    //             this.snackbar.success('Default Language Saved');
    //         });
    //     }
    //     this.closeDialog();
    // }
}
