import { Component, OnInit, ViewChild                         } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'households-import',
  templateUrl: './households-import.component.html',
  styleUrls: ['./households-import.component.scss']
})
export class HouseholdsImportComponent  {

  projects = new FormControl();
  projectList: string[] = ['a', 'b', 'c', 'd', 'e', 'f'];

}