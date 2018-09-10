import { Component, OnInit, HostListener } from '@angular/core';
import { HouseholdsService } from '../../../../core/api/households.service';
import { MatSnackBar } from '@angular/material';
import { saveAs } from 'file-saver/FileSaver';
import { ImportService } from '../../../../core/utils/import.service';
import { FormControl } from '@angular/forms';
import { DistributionData } from '../../../../model/distribution-data';
import { GlobalText } from '../../../../../texts/global';

@Component({
  selector: 'app-import-distribution',
  templateUrl: './import-distribution.component.html',
  styleUrls: ['./import-distribution.component.scss']
})
export class ImportDistributionComponent implements OnInit {

  dragAreaClass: string = 'dragarea';
  public TEXT = GlobalText.TEXTS;

  //upload
  response = "";
  public csv = null;
  comparing : boolean;
  compareAction : string;
  distribution : DistributionData;

  referedClassToken = DistributionData;
  public referedClassService;
  public load: boolean = false;

  constructor(
    public _householdsService: HouseholdsService,
    public snackBar: MatSnackBar,
    public _importService: ImportService,
  ) { }

  ngOnInit() {
    this.comparing = false;
    this.compareAction = "add";
  }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
      if (this.TEXT != GlobalText.TEXTS) {
        this.TEXT = GlobalText.TEXTS;
      }
    }
  
  /**
   * Get the csv template to import new household and ask 
   * to save it or just to open it in the computer
   */
  exportTemplate() {
    this._householdsService.getTemplate().toPromise()
      .then(response => {
        let arrExport = [];
        let reponse = response.json();
        if (!(reponse instanceof Array)) {
          this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: "right"});
        } else {
          arrExport.push(response.json()[0]); //0 represente le fichier csv et 1 son nom
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, response.json()[1]);
        }
      })
      .catch(error => {
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: "right"});
      });
  }

  /**
   * Detect when the file change with the file browse or with the drag and drop
   * @param event 
   * @param typeEvent 
   */
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

  /**
   * Upload csv and import the new distribution (list of beneficiaries)
   */
  updateDistribution() {
    this.comparing = true;
  }

  selectComparingAction(action : string) {
    
    if(action === "add" || action === "remove" || action === "error"){
      this.compareAction = action;
    }
  }

  goBack() {
    this.comparing = false;
  }


  /**
   * All listener for the drag and drop
   * @param event 
   */
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
    event.dataTransfer.setData("text", 'firefox');

    event.preventDefault();
    event.stopPropagation();

    this.fileChange(event, 'dataTransfer');
  }

}
