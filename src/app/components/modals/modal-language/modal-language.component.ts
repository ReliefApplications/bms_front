import { Component, OnInit } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { ModalComponent } from '../modal.component';

@Component({
    selector: 'app-modal-language',
    templateUrl: './modal-language.component.html',
    styleUrls: ['../modal.component.scss', './modal-language.component.scss']
})
export class ModalLanguageComponent extends ModalComponent implements OnInit {
    public languages = GlobalText.languages;
    public language = GlobalText.language;
    public isCheckedDefault = false;
    public actualUser;
    public default = false;
    public isArabic = false;

    ngOnInit() {
        this._cacheService.getUser().subscribe(response => {
            this.actualUser = response;
            this.default = response.language === this.language ? true : false;
        });
        this.isArabic = this.language === 'ar' ? true : false;
    }

    choseLanguage() {
        this.language !== this.actualUser.language ? this.default = false : this.default = true;
    }

    save() {
        GlobalText.changeLanguage(this.language);
        this.isArabic = this.language === 'ar' ? true : false;
        if (this.isCheckedDefault) {
            this.userService.setDefaultLanguage(this.actualUser.id, this.language).subscribe(response => {
                this.snackbar.success('Default Language Saved');
            });
        }
        this.closeDialog();
    }
}
