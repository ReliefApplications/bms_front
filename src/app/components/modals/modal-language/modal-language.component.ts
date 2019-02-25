import { Component, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';

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
    this.isArabic = this.language === 'ar' ?  true : false;
  }

  choseLanguage() {
    this.language !== this.actualUser.language ? this.default = false : this.default = true;
  }

  saveDefault() {
    !this.isCheckedDefault ? this.isCheckedDefault = true : this.isCheckedDefault = false;
  }

  save() {
    GlobalText.changeLanguage(this.language);
    this.isArabic = this.language === 'ar' ? true : false;
    if (this.isCheckedDefault) {
      this.userService.setDefaultLanguage(this.actualUser.id, this.language).subscribe(response => {
        this.snackBar.open('Default Language Saved', '', {duration: 3000, horizontalPosition: 'center'});
      });
    }
    this.closeDialog();
  }
}
