import { Component, OnInit, HostListener                          } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';

import { GlobalText                                               } from '../../../texts/global';

import { Project                                                  } from '../../model/project';

import { ProjectService                                           } from '../../core/api/project.service';
import { CacheService                                             } from '../../core/storage/cache.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DistributionData } from '../../model/distribution-data';
import { Mapper } from '../../core/utils/mapper.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-distribution',
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.scss']
})
export class DistributionComponent implements OnInit {
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
    private _cacheService: CacheService        
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
    this.projectService.get().subscribe(response => {
      this.projects = this.projectClass.formatArray(response.json());
      this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[this.projectClass.__classname__.toUpperCase() + "S"], this.projects);
    })
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
    this.router.navigate(["distribution/add-distribution"], {queryParams: {project: this.selectedProject.id}});
  }
}
