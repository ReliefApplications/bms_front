import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HouseholdsService } from '../../../core/api/households.service';

import { saveAs } from 'file-saver/FileSaver';

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
  projectList: string[] = ['a', 'b', 'c', 'd', 'e', 'f'];

  //upload
  response = "";
  public csv: Array<any> = [];

  dragAreaClass: string = 'dragarea';

  constructor(
    public referedClassService: HouseholdsService
  ) { }

  ngOnInit() {
    
  }

  fileChange(event, typeEvent) {
    let fileList: FileList

    switch (typeEvent) {
      case 'dataTransfer': fileList = event.dataTransfer.files; break;
      case 'target': fileList = event.target.files; break;
      default: break;
    }

    if (fileList.length > 0) {
      this.csv.push(fileList[0]);

    }
    console.log(this.csv);
    
  }


  selectTitle(title): void {
    this.isBoxClicked = true;
    this.selectedTitle = title;
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


  @HostListener('dragover', ['$event']) onDragOver(event) {
    this.dragAreaClass = "dragarea-hover";
    console.log(this.dragAreaClass);
    event.preventDefault();
  }
  @HostListener('dragenter', ['$event']) onDragEnter(event) {
    this.dragAreaClass = "dragarea-hover";
    console.log(this.dragAreaClass);
    event.preventDefault();
  }
  @HostListener('dragend', ['$event']) onDragEnd(event) {
    this.dragAreaClass = "dragarea";
    console.log(this.dragAreaClass);
    event.preventDefault();
  }
  @HostListener('dragleave', ['$event']) onDragLeave(event) {
    this.dragAreaClass = "dragarea";
    console.log(this.dragAreaClass);
    event.preventDefault();
  }
  @HostListener('drop', ['$event']) onDrop(event) {
    console.log(event.target.id);
    this.dragAreaClass = "dragarea";
    console.log(this.dragAreaClass);

    // setting the data is required by firefox
    event.dataTransfer.setData("text", 'aa');
    
    event.preventDefault();
    event.stopPropagation();

    this.fileChange(event, 'dataTransfer');
  }
}