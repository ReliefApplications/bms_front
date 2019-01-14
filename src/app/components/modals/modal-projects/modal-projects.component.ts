import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';

@Component({
  selector: 'app-modal-projects',
  templateUrl: './modal-projects.component.html',
  styleUrls: ['../modal.component.scss', './modal-projects.component.scss']
})
export class ModalProjectsComponent extends ModalComponent {
  public projects = [];
  public project;

  ngOnInit() {
    this.projects = this.data.projects
  }

  save(){
    this.importService.saveProject(this.project)
    this.closeDialog();
  }
}
