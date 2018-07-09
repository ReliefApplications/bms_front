import { Component, OnInit, ViewChild                         } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HouseholdsService } from '../../../core/api/households.service';

import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'households-import',
  templateUrl: './households-import.component.html',
  styleUrls: ['./households-import.component.scss']
})
export class HouseholdsImportComponent implements OnInit {


  projects = new FormControl();
  projectList: string[] = ['a', 'b', 'c', 'd', 'e', 'f'];

  constructor(
    public referedClassService: HouseholdsService
  ) {}

  ngOnInit() {
  }

  exportTemplate() {
    this.referedClassService.getTemplate().toPromise()
    .then(response => {
      let arrExport = [];
      let reponse = response.json();
      console.log(response);
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
}