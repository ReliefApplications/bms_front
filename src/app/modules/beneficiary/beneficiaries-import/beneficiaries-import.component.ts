import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HouseholdsService } from '../../../core/api/households.service';

import { saveAs } from 'file-saver/FileSaver';
import { ImportService } from '../../../core/utils/import.service';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';
import { forEach } from '@angular/router/src/utils/collection';
import { GlobalText } from '../../../../texts/global';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'beneficiaries-import',
  templateUrl: './beneficiaries-import.component.html',
  styleUrls: ['./beneficiaries-import.component.scss']
})
export class BeneficiariesImportComponent implements OnInit {
  public nameComponent = 'beneficiaries_import_title';
  public household = GlobalText.TEXTS;

  // for the items button
  selectedTitle = 'file import';
  isBoxClicked = false;

  // for the selector
  projects = new FormControl();
  projectList: string[] = [];
  public selectedProject: string = null;

  // upload
  response = '';
  public csv = null;

  dragAreaClass = 'dragarea';


  referedClassToken = Project;
  public referedClassService;
  public project;
  public load = false;

  constructor(
    public _householdsService: HouseholdsService,
    public _importService: ImportService,
    public _projectService: ProjectService,
    private router: Router,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.getProjects();
  }

  /**
 * check if the langage has changed
 */
  ngDoCheck() {
    if (this.household !== GlobalText.TEXTS) {
      this.household = GlobalText.TEXTS;
    }
  }

  /**
   * Get list of all project and put it in the project selector
   */
  getProjects() {
    this.referedClassService = this._projectService;
    this.referedClassService.get().subscribe(response => {
      response = this.referedClassToken.formatArray(response);
      response.forEach(element => {
        const concat = element.id + ' - ' + element.name;
        this.projectList.push(concat);
      });
    });
  }

  /**
   * Detect when the file change with the file browse or with the drag and drop
   * @param event
   * @param typeEvent
   */
  fileChange(event, typeEvent) {
    let fileList: FileList;

    switch (typeEvent) {
      case 'dataTransfer': fileList = event.dataTransfer.files; break;
      case 'target': fileList = event.target.files; break;
      default: break;
    }

    if (fileList.length > 0) {
      this.csv = fileList[0];
    }
  }

  /**
   * Detect which button item (file import or api import) is selected
   * @param title
   */
  selectTitle(title): void {
    this.isBoxClicked = true;
    this.selectedTitle = title;
  }

  /**
   * Get the csv template to import new household and ask
   * to save it or just to open it in the computer
   */
  exportTemplate() {
    this._householdsService.getTemplate().toPromise()
      .then(response => {
        const arrExport = [];
        const reponse = response;
        if (!(reponse instanceof Array)) {
          this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: 'center'});
        } else {
          arrExport.push(response[0]); // 0 represente le fichier csv et 1 son nom
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, response[1]);
        }
      })
      .catch(error => {
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: 'center'});
      });
  }

  /**
   * Get the project selected in the projectList selector
   * @param event
   */
  getProjectSelected(event) {
    this.selectedProject = event.value;
  }

  /**
   * Send csv file and project to import new households
   */
  addHouseholds() {
    const data = new FormData();

    if (!this.csv || !this.selectedProject || this.load) {
        this.snackBar.open('You must select a project and add a file before uploading', '', { duration: 3000, horizontalPosition: 'center' });
    } else {
        const project = this.selectedProject.split(' - ');
        data.append('file', this.csv);
        const step = 1;
        this.load = true;
        this._importService.sendData(data, project[0], step).then(() => {
        this.router.navigate(['/beneficiaries/data-validation']);
        }, () => {
        this.load = false;
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: 'center'});
        })
        .catch(
            () => {
                this.load = false;
                this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: 'center'});
            }
        );
    }
  }


  /**
   * All listener for the drag and drop
   * @param event
   */
  @HostListener('dragover', ['$event']) onDragOver(event) {
    this.dragAreaClass = 'dragarea-hover';
    event.preventDefault();
  }
  @HostListener('dragenter', ['$event']) onDragEnter(event) {
    this.dragAreaClass = 'dragarea-hover';
    event.preventDefault();
  }
  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.dragAreaClass = 'dragarea';
    event.preventDefault();
  }
  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    this.dragAreaClass = 'dragarea';
    event.preventDefault();
  }
  @HostListener('drop', ['$event']) onDrop(event) {
    this.dragAreaClass = 'dragarea';

    // setting the data is required by firefox
    event.dataTransfer.setData('text', 'firefox');

    event.preventDefault();
    event.stopPropagation();

    this.fileChange(event, 'dataTransfer');
  }
}
