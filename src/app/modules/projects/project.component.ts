import { Component, OnInit, HostListener                          } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSnackBar } from '@angular/material';

import { GlobalText                                               } from '../../../texts/global';

import { Project                                                  } from '../../model/project';

import { ProjectService                                           } from '../../core/api/project.service';
import { CacheService                                             } from '../../core/storage/cache.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DistributionData } from '../../model/distribution-data';
import { Mapper } from '../../core/utils/mapper.service';
import { Router } from '@angular/router';

import { saveAs } from 'file-saver/FileSaver';

import { ExportInterface } from '../../model/export.interface';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public nameComponent = "distribution_title";
  public distribution = GlobalText.TEXTS;

  projects: Project[];
  distributionData: MatTableDataSource<any>;
  distributionClass = DistributionData;
  projectClass = Project;

  selectedTitle = "";
  selectedProject = null;
  isBoxClicked = false;

  public maxHeight =  GlobalText.maxHeight;
  public maxWidthMobile = GlobalText.maxWidthMobile;
  public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
  public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
  public maxWidth = GlobalText.maxWidth;
  public heightScreen;
  public widthScreen;

  constructor(
    public projectService: ProjectService,
    public distributionService: DistributionService,
    public mapperService : Mapper,
    private router: Router,
    private _cacheService: CacheService,
    public snackBar: MatSnackBar,    
  ) { }

  ngOnInit() {
    this.getProjects();
    this.checkSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.distribution != GlobalText.TEXTS) {
      this.distribution = GlobalText.TEXTS;
      this.nameComponent = GlobalText.TEXTS.distribution_title;
    }
  }

  /**
   * update current project and its distributions when a other project box is clicked
   * @param title
   * @param project
   */
  selectTitle(title, project): void {
    this.isBoxClicked = true;
    this.selectedTitle = title;
    this.selectedProject = project;
    this.getDistributionsByProject(project.id);
  }

  //TO DO : get from cache
  /**
   * get all projects
   */
  getProjects(): void {
    let promise = this.projectService.get();
    if(promise) {
      promise.toPromise().then(response => {
        this.projects = this.projectClass.formatArray(response.json());
        this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[this.projectClass.__classname__.toUpperCase() + "S"], this.projects);
        this.selectTitle(this.projects[0].name, this.projects[0]);
      })
    }
  }

  /**
   * get all distributions of a project
   * @param projectId
   */
  getDistributionsByProject(projectId : number): void {
    this.distributionService.getByProject(projectId).subscribe(response => {
      let distribution = DistributionData.formatArray(response.json());
      this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[DistributionData.__classname__.toUpperCase() + "S"], distribution);
      this.distributionData = new MatTableDataSource(distribution);
    })
  }

  addDistribution(){
    this.router.navigate(["project/add-project"], {queryParams: {project: this.selectedProject.id}});
  }

  /**
   * to export distribution data
   */
  export() {
    this.distributionService.export().toPromise()
      .then(response => {
        const arrExport = [];
        const reponse: ExportInterface = response.json() as ExportInterface;

        if (!(reponse instanceof Object)) {
          this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: "right"});
        } else {
          arrExport.push(reponse.content);
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, reponse.filename);
        }
      })
      .catch(error => {
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: "right"});
      });
  }
}
