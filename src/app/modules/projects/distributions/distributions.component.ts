import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { DistributionService } from '../../../core/api/distribution.service';
import { Households } from '../../../model/households';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms' 
import { ActivatedRoute } from '@angular/router';
import { DistributionData } from '../../../model/distribution-data';
import { CacheService } from '../../../core/storage/cache.service';
import { Beneficiaries } from '../../../model/beneficiary';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { MatTableDataSource, MatSnackBar, MatDialog, MatFormField } from '@angular/material';
import { ExportInterface } from '../../../model/export.interface';
import { saveAs } from 'file-saver/FileSaver';
import { Mapper } from '../../../core/utils/mapper.service';

@Component({
  selector: 'app-distributions',
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {

  distributionId : number;
  actualDistribution : DistributionData;

  loadingFirstStep : boolean;
  loadingThirdStep : boolean;
  enteredEmail : string;
  
  //Entities passed to table components
  beneficiaryEntity = Beneficiaries;
  distributionEntity = DistributionData;

  //Datas
  beneficiaryData : MatTableDataSource<any>;
  importedData : any;
  randomSampleData : MatTableDataSource<any>;

  //Screen display variables.
  public maxHeight =  GlobalText.maxHeight;
  public maxWidthMobile = GlobalText.maxWidthMobile;
  public heightScreen;
  public widthScreen;
  TEXT = GlobalText.TEXTS;

  //AddBeneficiary Dialog variables.
  beneficiaryForm = new FormControl();
  beneficiaryList = new Array<Beneficiaries>();
  selectedBeneficiaries : any[];

  //Stepper forms.
  form1 : FormGroup;
  form2 : FormGroup;
  form3 : FormGroup;
  form4 : FormGroup;

  constructor(
    public distributionService : DistributionService,
    public cacheService : CacheService,
    private formBuilder : FormBuilder,
    private route: ActivatedRoute,
    private beneficiariesService : BeneficiariesService,
    public snackBar: MatSnackBar,
    public mapperService : Mapper,
    private dialog : MatDialog,
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
    this.getSelectedDistribution();
    this.updateSteps();
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
   * Updates the value of the beneficiaries tables from step to step
   **/
  updateSteps() {
    this.generateRandom();
    this.getDistributionBeneficiaries();
    console.log("hi");
  } 

  /**
   * Gets the distribution launched from the cache
   */
  getSelectedDistribution() {
    let distributionsList = this.cacheService.get(CacheService.DISTRIBUTIONS);
    distributionsList = JSON.parse(distributionsList._body);

    if(distributionsList)
    {
      distributionsList.forEach(element => {
        if(element.id == this.distributionId)
        {
          this.actualDistribution = element;
        }
      });
    
    }
  }

  /**
   * Gets the Beneficiaries of the actual distribution to display the table
   */
  getDistributionBeneficiaries() {
    this.loadingFirstStep = true;
    this.distributionService.getBeneficiaries(this.distributionId)
    .subscribe(
      response => {
        let data = response.json();
        //console.log("All: ",data);
        this.beneficiaryData = new MatTableDataSource( Beneficiaries.formatArray(data) );
        this.loadingFirstStep = false;
      },
      error => {
        // console.log("Error: ", error);
      }
    );
  }

  /**
   * Gets all the beneficiaries of the project to be able to add some to this distribution
   */
  getProjectBeneficiaries() {

    // let allDistributions = new Array<DistributionData>();

    // this.distributionService.getByProject(this.actualDistribution.project.id)
    //   .subscribe(
    //     response => {
    //       allDistributions = DistributionData.formatArray(response.json());

    //       allDistributions.forEach(
    //         element => { 
    //           this.distributionService.getBeneficiaries(element.id)
    //             .subscribe(
    //               response => {
    //                 this.beneficiaryList.push( Beneficiaries.formatElement(response.json()) );
    //                 console.log('', this.beneficiaryList);
    //               },
    //               error => {
    //                 //err.
    //               }
    //             )
    //          }
    //       )

    //     },
    //     error => {
    //       //err.
    //     }
    //   );
  }

  /**
   * Handles the csv export of the data table
   */
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

  /**
   * Generates a table of 10 random beneficiaries from this distribution
   */
  generateRandom() {
    this.loadingThirdStep = true;
    this.beneficiariesService.getRandom(this.distributionId)
      .subscribe(
        response => { 
          let data = response.json();
          //console.log("random: ",data);
          this.randomSampleData = new MatTableDataSource( Beneficiaries.formatArray(data) );
        }
      )
    this.loadingThirdStep = false;
  } 

  test() {
    // TODO : connect to new beneficiary functionnality with project & distribution already filled.
  }

  /**
   * Opens a dialog corresponding to the ng-template passed as a parameter
   * @param template 
   */
  openDialog(template) {
    this.dialog.open(template);
  }

  //To confirm on Validation dialog
  confirmValidation() {
    let actualUser = this.cacheService.get(CacheService.USER);

    if(this.enteredEmail && actualUser.username === this.enteredEmail) {
      // TODO : transaction
      this.snackBar.open("Transaction confirmed", '', { duration : 3000, horizontalPosition: 'center'} );
    }
    else {
      this.snackBar.open("Wrong email", '', { duration : 3000, horizontalPosition: 'center'} );
    }

    this.dialog.closeAll();
  }

  //To cancel on Validation dialog
  exitValidation() {
    this.snackBar.open("Transaction canceled", '', { duration : 3000, horizontalPosition: 'center'} );
    this.dialog.closeAll();
  }

  //To confirm on AddBeneficiary dialog
  confirmAdding() {
    this.beneficiariesService.update(this.distributionId, this.selectedBeneficiaries[0] );
    this.dialog.closeAll();
  }

  //To cancel on AddBeneficiary dialog
  exitAdding() {
    this.dialog.closeAll();
  }

}
