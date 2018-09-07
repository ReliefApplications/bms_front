import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { DistributionService } from '../../../core/api/distribution.service';
import { Households } from '../../../model/households';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms' 
import { ActivatedRoute } from '@angular/router';
import { DistributionData } from '../../../model/distribution-data';
import { CacheService } from '../../../core/storage/cache.service';
import { Beneficiaries } from '../../../model/beneficiary';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { ExportInterface } from '../../../model/export.interface';
import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-distributions',
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {

  distributionId : number;
  distribution : DistributionData;
  TEXT = GlobalText.TEXTS;
  beneficiaryEntity = Beneficiaries;
  beneficiaryData : MatTableDataSource<any>;
  importedData : any;
  randomSampleData : any;
  finalData : any;
  loading : boolean;

  public maxHeight =  GlobalText.maxHeight;
  public maxWidthMobile = GlobalText.maxWidthMobile;
  public heightScreen;
  public widthScreen;

  form1 : FormGroup;
  form2 : FormGroup;
  form3 : FormGroup;
  form4 : FormGroup;

  constructor(
    public distributionService : DistributionService,
    public cacheService : CacheService,
    private formBuilder : FormBuilder,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,    
  ) { 
    this.route.params.subscribe( params => this.distributionId = params.id);
  }

  ngOnInit() {
    this.checkSize();
    
    this.form1 = this.formBuilder.group({
      //first : new FormControl()
    });
    this.form2 = this.formBuilder.group({
      //second : new FormControl()
    });
    this.form3 = this.formBuilder.group({
      //third : new FormControl()
    });
    this.form4 = this.formBuilder.group({
      //fourth : new FormControl()
    });
    this.loading = true;
    this.getSelectedDistribution();
    this.getBeneficiaries();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  getSelectedDistribution() {
    let distributionsList = this.cacheService.get(CacheService.DISTRIBUTIONS);
    distributionsList = JSON.parse(distributionsList._body);

    if(distributionsList)
    {
      distributionsList.forEach(element => {
        if(element.id == this.distributionId)
        {
          this.distribution = element;
        }
      });
    
    }
  }

  getBeneficiaries() {
    this.distributionService.getBeneficiaries(this.distributionId)
    .subscribe(
      response => {
        let data = response.json();
        this.beneficiaryData = new MatTableDataSource( Beneficiaries.formatArray(data) );
        this.loading = false;
      },
      error => {
        // console.log("Error: ", error);
      }
    );
  }

  test() {
    // TODO : connect to new beneficiary functionnality with project & distribution already filled.
  }

  export(){
    this.distributionService.export("distribution", this.distributionId).toPromise()
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
