import { Component, OnInit, HostListener, DoCheck, Input } from '@angular/core';
import { HouseholdsService } from '../../../../core/api/households.service';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { saveAs } from 'file-saver/FileSaver';
import { ImportService } from '../../../../core/utils/import.service';
import { FormControl } from '@angular/forms';
import { DistributionData } from '../../../../model/distribution-data';
import { GlobalText } from '../../../../../texts/global';
import { DistributionService } from '../../../../core/api/distribution.service';
import { Beneficiaries } from '../../../../model/beneficiary';
import { BeneficiariesService } from '../../../../core/api/beneficiaries.service';
import { ImportedBeneficiary } from '../../../../model/imported-beneficiary';

const IMPORT_COMPARE = 1;
const IMPORT_UPDATE = 2;

@Component({
  selector: 'app-import-distribution',
  templateUrl: './import-distribution.component.html',
  styleUrls: ['./import-distribution.component.scss']
})
export class ImportDistributionComponent implements OnInit, DoCheck {

    dragAreaClass = 'dragarea';
    public TEXT = GlobalText.TEXTS;

    @Input() distribution: DistributionData;

    // upload
    response = '';
    public csv = null;
    comparing: boolean;
    compareAction: string;

    // indicators
    referedClassToken = DistributionData;
    beneficiaryEntity = Beneficiaries;
    importedBeneficiaryEntity = ImportedBeneficiary;
    public loadFile = false;
    public loadUpdate = false;

    // datas
    addingData: MatTableDataSource<any>;
    removingData: MatTableDataSource<any>;
    errorsData: MatTableDataSource<any>;

  constructor(
    public _householdsService: HouseholdsService,
    public snackBar: MatSnackBar,
    public _importService: ImportService,
    public distributionService: DistributionService,
    public beneficiaryService: BeneficiariesService,
  ) { }

  ngOnInit() {
    this.comparing = false;
    this.compareAction = 'add';
    console.log(this.distribution);
  }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
      if (this.TEXT !== GlobalText.TEXTS) {
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
        const arrExport = [];
        const reponse = response.json();
        if (!(reponse instanceof Array)) {
          this.snackBar.open('No data to export', '', { duration: 3000, horizontalPosition: 'right'});
        } else {
          arrExport.push(response.json()[0]); // 0 represente le fichier csv et 1 son nom
          const blob = new Blob(arrExport, { type: 'text/csv' });
          saveAs(blob, response.json()[1]);
        }
      })
      .catch(error => {
        this.snackBar.open('Error while importing data', '', { duration: 3000, horizontalPosition: 'right'});
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
   * Upload csv and import the new distribution (list of beneficiaries)
   */
  updateDistribution(step: number) {

    // const project = this.distribution.project.id;
    const data = new FormData();
    data.append('file', this.csv);

    if (this.csv && step === IMPORT_COMPARE) {
        this.comparing = true;
        let tables;

        this.beneficiaryService.import(this.distribution.id, data, IMPORT_COMPARE)
            .subscribe(
                result => {
                    tables = result.json();

                    console.log(tables);
                    console.log('result', result);
                    this.errorsData = new MatTableDataSource(ImportedBeneficiary.formatArray(tables[0]));
                    this.addingData = new MatTableDataSource(ImportedBeneficiary.formatArray(tables[1]));
                    this.removingData = new MatTableDataSource(ImportedBeneficiary.formatArray(tables[2]));
                }
            );
    } else if (this.csv && step === IMPORT_UPDATE) {
        this.loadUpdate = true;
        this.beneficiaryService.import(this.distribution.id, data, IMPORT_UPDATE)
        .subscribe(
            success => {
                this.loadUpdate = false;
                this.snackBar.open('Distribution updated', '', { duration: 3000, horizontalPosition: 'center'});
            }
        );
        this.csv = null;
        this.comparing = false;
    } else {
        console.log('Error / empty csv');
    }
  }

  selectComparingAction(action: string) {
    if (action === 'add' || action === 'remove' || action === 'error') {
      this.compareAction = action;
    }
  }

  goBack() {
    this.comparing = false;
  }

  getRightData() {
    let rightData;

    switch (this.compareAction) {
      case 'add': rightData = this.addingData;
        break;
      case 'remove': rightData = this.removingData;
        break;
      case 'error': rightData = this.errorsData;
        break;
      default: break;
    }

    return(rightData);
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
