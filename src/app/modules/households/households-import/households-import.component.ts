import { Component, OnInit, ViewChild, HostListener} from '@angular/core';
import { FormControl } from '@angular/forms';
import { HouseholdsService } from '../../../core/api/households.service';

import { saveAs } from 'file-saver/FileSaver';
import { ImportService } from '../../../core/utils/import.service';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'households-import',
  templateUrl: './households-import.component.html',
  styleUrls: ['./households-import.component.scss']
})
export class HouseholdsImportComponent implements OnInit {
  //for the items button
  selectedTitle = "";
  isBoxClicked = false;

  //Fake data for selector
  //TODO : delete when projects getsin back
  projects = new FormControl();
  projectList: string[] = [];

  //upload
  response = "";
  public csv = null;

  dragAreaClass: string = 'dragarea';

  public selectedProject: string = null;
  referedClassToken = Project;
  public referedClassService;
  public project;

  constructor(
    public _householdsService: HouseholdsService,
    public _importService: ImportService,
    public _projectService: ProjectService
  ) { }

  ngOnInit() {
    this.getProjects();
  }

  getProjects() {
    this.referedClassService = this._projectService;
    this.referedClassService.get().subscribe( response => {
      response = this.referedClassToken.formatArray(response.json());
      response.forEach(element => {
        var concat = element.id + " - " + element.name;
        this.projectList.push(concat);
      });
    });    
  }

  fileChange(event, typeEvent) {
    let fileList: FileList

    switch (typeEvent) {
      case 'dataTransfer': fileList = event.dataTransfer.files; break;
      case 'target': fileList = event.target.files; break;
      default: break;
    }

    if (fileList.length > 0) {
      this.csv = fileList[0];
    }
  }


  selectTitle(title): void {
    this.isBoxClicked = true;
    this.selectedTitle = title;
  }

  exportTemplate() {
    this._householdsService.getTemplate().toPromise()
      .then(response => {
        let arrExport = [];
        let reponse = response.json();
        if (!(reponse instanceof Array)) {
          console.log("Auncune donnée à exporter");
        } else {
          arrExport.push(response.json()[0]); //0 represente le fichier csv et 1 son nom
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, response.json()[1]);
        }
      })
      .catch(error => {
        console.log("Auncune donnée à exporter");
      });
  }


  @HostListener('dragover', ['$event']) onDragOver(event) {
    this.dragAreaClass = "dragarea-hover";
    event.preventDefault();
  }
  @HostListener('dragenter', ['$event']) onDragEnter(event) {
    this.dragAreaClass = "dragarea-hover";
    event.preventDefault();
  }
  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }
  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    this.dragAreaClass = "dragarea";
    event.preventDefault();
  }
  @HostListener('drop', ['$event']) onDrop(event) {
    this.dragAreaClass = "dragarea";

    // setting the data is required by firefox
    event.dataTransfer.setData("text", 'aa');
    
    event.preventDefault();
    event.stopPropagation();

    this.fileChange(event, 'dataTransfer');
  }

  getProjectSelected(event) {
    this.selectedProject = event.value;
    console.log(this.selectedProject);
     
  }

  addHouseholds() {
    var data = new FormData();
    var project = this.selectedProject.split(" - ");
    data.append('project', project[0]);
    data.append('file', this.csv);
   
    this._importService.sendData(data, project[0]);
  }
}