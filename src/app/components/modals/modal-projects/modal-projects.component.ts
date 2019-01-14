import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';

@Component({
  selector: 'app-modal-projects',
  templateUrl: './modal-projects.component.html',
  styleUrls: ['../modal.component.scss', './modal-projects.component.scss']
})
export class ModalProjectsComponent extends ModalComponent {
  // public languages = GlobalText.languages;
  selectedValue: string;
  // public isCheckedDefault = false;
  // public actualUser;
  public projects = [];
  project;

  ngOnInit() {
    this.projects = this.data.projects
  }

  // choseLanguage(l : string){
  //   this.language = l;
  // }

  // saveDefault() {
  //   !this.isCheckedDefault ? this.isCheckedDefault = true : this.isCheckedDefault = false;
  // }

  save(){
    this.importService.saveProject(this.project)
    this.closeDialog();
  }
}
