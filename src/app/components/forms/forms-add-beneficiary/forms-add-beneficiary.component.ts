import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalText } from '../../../../texts/global';
import { FormControl } from '@angular/forms';
import { CriteriaService } from '../../../core/api/criteria.service';
import { VulnerabilityCriteria } from '../../../model/vulnerability_criteria';
import { MatInput } from '@angular/material';
import { AddBeneficiaryService } from '../../../core/utils/add-beneficiary.service';

@Component({
  selector: 'forms-add-beneficiary',
  templateUrl: './forms-add-beneficiary.component.html',
  styleUrls: ['./forms-add-beneficiary.component.scss']
})
export class FormsAddBeneficiaryComponent implements OnInit {

  @Input() status;

  @ViewChild ('FamilyName') familyName : ElementRef;
  @ViewChild ('GivenName') givenName : ElementRef;
  @ViewChild ('DateOfBirth') dateOfBirth : ElementRef;
  @ViewChild ('NationalID') nationalID : ElementRef;
  @ViewChild ('Livelihood') livelihood: ElementRef;
  @ViewChild ('Phone') phone : ElementRef;

  
  public oldFamilyName = '';
  public oldGivenName = '';
  public oldDateOfBirth = '';
  public oldNationalID = '';
  public oldLivelihood = '';
  public oldPhone = '';

  public household = GlobalText.TEXTS;

  //for the type phone selector
  public typePhone = new FormControl('type1');
  public typePhoneList: string[] = ['type1'];
  public selectedtypePhone: string = '';

  //for the type national id selector
  public typeNationalId = new FormControl('card');
  public typeNationalIdList: string[] = ['type1', 'card'];
  public selectedtypeNationalId: string = '';

  //for the gender selector
  public gender = new FormControl();
  public genderList: string[] = ['F', 'M'];
  public selectedGender: string = null;

  // public occupation = new FormControl();
  public allVulnerability = [];
  public selectedVulnerabilities = [];

  constructor(
    public _criteriaService: CriteriaService,
    public _addBeneficiariesService: AddBeneficiaryService
  ) { }

  ngOnInit() {
    this.getVulnerabilityCriteria();
  }

  /**
  * check if the langage has changed
  */
  ngDoCheck() {
    if (this.household != GlobalText.TEXTS) {
      this.household = GlobalText.TEXTS;
    }
    if (this.givenName.nativeElement.value != this.oldGivenName) {
      this.oldGivenName = this.givenName.nativeElement.value;
      this._addBeneficiariesService.setVariable('givenName', this.oldGivenName);
    }
    if (this.dateOfBirth.nativeElement.value != this.oldDateOfBirth) {
      this.oldDateOfBirth = this.dateOfBirth.nativeElement.value
      this._addBeneficiariesService.setVariable('dateOfBirth', this.oldDateOfBirth);      
    }
    if (this.nationalID.nativeElement.value != this.oldNationalID) {
      this.oldNationalID = this.nationalID.nativeElement.value
      this._addBeneficiariesService.setVariable('nationalID', this.oldNationalID);    
    }
    if(this.status === 0) {
      if (this.livelihood.nativeElement.value != this.oldLivelihood) {
        this.oldLivelihood = this.livelihood.nativeElement.value;
        this._addBeneficiariesService.setVariable('livelihood', this.oldLivelihood);      
      }
    }
    if (this.familyName.nativeElement.value != this.oldFamilyName) {
      this.oldFamilyName = this.familyName.nativeElement.value ;
      this._addBeneficiariesService.setVariable('familyName', this.oldFamilyName);    
    }
    if (this.phone.nativeElement.value != this.oldPhone) {
      this.oldPhone = this.phone.nativeElement.value ;
      this._addBeneficiariesService.setVariable('phone', this.oldPhone);    
    }
  }

   /**
   * Get list of all Vulnerabilities
   */
  getVulnerabilityCriteria() {
    this._criteriaService.getVulnerabilityCriteria().subscribe(response => {
      let responseCriteria = VulnerabilityCriteria.formatArray(response.json());
      responseCriteria.forEach(element => {
        this.allVulnerability.push(element);
      });
    });
  }

  selected(event, type: string) {
    switch(type) {
      case 'gender':
        this._addBeneficiariesService.gender = event.value;
        break;
      case 'typeNationalId':
        this._addBeneficiariesService.typeNationalID = event.value;
        break;
      case 'typePhone':
        this._addBeneficiariesService.typePhone = event.value;
        break;
    }
  }

    /**
   * use to check vulnerabilites in member
   * @param vulnerablity 
   */
  choiceVulnerabilities(vulnerablity: VulnerabilityCriteria) {
    let vulnerabilityFound = false;
    if (this.selectedVulnerabilities.length === 0) {
      this.selectedVulnerabilities.push(vulnerablity.id);
    } else {
      this.selectedVulnerabilities.forEach(element => {
        if (element === vulnerablity.id) {
          this.selectedVulnerabilities.splice(this.selectedVulnerabilities.indexOf(vulnerablity.id), 1);
          vulnerabilityFound = true;
        }
      })
      if (!vulnerabilityFound) {
        this.selectedVulnerabilities.push(vulnerablity.id);
      }
    }

    this._addBeneficiariesService.vulnerabilities = this.selectedVulnerabilities;
  }

}
