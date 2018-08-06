import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FormControl } from '@angular/forms';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../model/project';

@Component({
  selector: 'add-household',
  templateUrl: './addHousehold.component.html',
  styleUrls: ['./addHousehold.component.scss']
})
export class AddHouseholdComponent implements OnInit {

  public nameComponent = "add_household_title";
  public household = GlobalText.TEXTS;

  public referedClassService;

  //for the project selector
  projects = new FormControl();
  projectList: string[] = [];
  public selectedProject: string = null;

  constructor(
    public _projectService: ProjectService,
  ) { }

  ngOnInit() {
    this.getProjects();
  }

  /**
    * check if the langage has changed
    */
  ngDoCheck() {
    if (this.household != GlobalText.TEXTS) {
      this.household = GlobalText.TEXTS;
    }
  }

  /**
  * Get list of all project and put it in the project selector
  */
  getProjects() {
    this.referedClassService = this._projectService;
    this.referedClassService.get().subscribe(response => {
      response = Project.formatArray(response.json());
      response.forEach(element => {
        var concat = element.id + " - " + element.name;
        this.projectList.push(concat);
      });
    });
  }

  getProjectSelected(event) {

  }

}
