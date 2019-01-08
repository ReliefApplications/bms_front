import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';

@Component({
  selector: 'app-modal-language',
  templateUrl: './modal-language.component.html',
  styleUrls: ['../modal.component.scss', './modal-language.component.scss']
})
export class ModalLanguageComponent extends ModalComponent {
  public languages = GlobalText.languages;
  public language = GlobalText.language;
  public isCheckedDefault = false;
  public actualUser;

  ngOnInit() {
    this._cacheService.getUser().subscribe(response => this.actualUser = response)
  }

  choseLanguage(l : string){
    this.language = l;
  }

  saveDefault() {
    !this.isCheckedDefault ? this.isCheckedDefault = true : this.isCheckedDefault = false;
  }

  save(){
    GlobalText.changeLanguage(this.language);
    if (this.isCheckedDefault) {
      this.userService.setDefaultLanguage(this.actualUser.id, this.language).subscribe(response => {
        this.snackBar.open('Default Language Saved','', {duration: 3000, horizontalPosition: 'center'});
      })
    };
    this.closeDialog();
  }
}
