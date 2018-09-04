import { Component, OnInit, HostListener } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { DistributionService } from '../../../core/api/distribution.service';
import { Households } from '../../../model/households';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms' 
import { ActivatedRoute } from '@angular/router';
import { DistributionData } from '../../../model/distribution-data';

@Component({
  selector: 'app-distributions',
  templateUrl: './distributions.component.html',
  styleUrls: ['./distributions.component.scss']
})
export class DistributionsComponent implements OnInit {

  distributionId : number;
  distribution : DistributionData;
  TEXT = GlobalText.TEXTS;
  step : number;
  beneficiaryEntity : Households;
  beneficiaryData : {}[];

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
    private formBuilder : FormBuilder,
    private route: ActivatedRoute
  ) { 
    this.route.params.subscribe( params => this.distributionId = params.id);
  }

  ngOnInit() {
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
    
    //this.distributionService.get(); //need get 1 distrib by id (or pass the distrib from projects by calling this ocmponent differently)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  addBeneficiary() {
    // TODO : connect to new beneficiary functionnality with project & distribution already filled.
  }

  nextStep() {
    this.step++;
  }

}
