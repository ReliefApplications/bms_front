import { Component, OnInit } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { ModalComponent } from '../modal.component';
import { User } from './../../../model/user.new';

@Component({
    selector: 'app-modal-language',
    templateUrl: './modal-language.component.html',
    styleUrls: ['../modal.component.scss', './modal-language.component.scss']
})
export class ModalLanguageComponent extends ModalComponent implements OnInit {
    public languages = GlobalText.languages;
    public language = GlobalText.language;
    public isCheckedDefault = false;
    public actualUser: User;
    public default = false;
    public isArabic = false;

    ngOnInit() {
        this._cacheService.getUser().subscribe((user: User) => {
            this.actualUser = user;
            this.default = user.get<string>('language') === this.language ? true : false;
        });
        this.isArabic = this.language === 'ar' ? true : false;
    }

    choseLanguage() {
        this.language !== this.actualUser.get<string>('language') ? this.default = false : this.default = true;
    }

    save() {
        GlobalText.changeLanguage(this.language);
        this.isArabic = this.language === 'ar' ? true : false;
        if (this.isCheckedDefault) {
            this.userService.setDefaultLanguage(this.actualUser.get('id'), this.language).subscribe(response => {
                this.snackbar.success('Default Language Saved');
            });
        }
        this.closeDialog();
    }
}
