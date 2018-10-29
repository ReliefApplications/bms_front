import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, ErrorStateMatcher, MatSnackBar } from '@angular/material';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';

import { CacheService } from '../../core/storage/cache.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { SectorService } from '../../core/api/sector.service';

import { GlobalText } from '../../../texts/global';
import { CriteriaService } from '../../core/api/criteria.service';
import { ModalitiesService } from '../../core/api/modalities.service';
import { isArray } from 'util';
import { User } from '../../model/user';
import { UserService } from '../../core/api/user.service';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  public modal = GlobalText.TEXTS;

  public entityInstance = null;
  public properties: any;
  propertiesTypes: any;
  public loadedData: any = [];
  newObject: any;
  public controls = new FormControl();

  form = new FormGroup({
    projectsControl: new FormControl({value: '', disabled: 'true'}),
    countryControl: new FormControl({value: '', disabled: 'true'}),
    emailFormControl: new FormControl('', [ Validators.required, Validators.email ]),
  });

  emailFormControl= new FormControl('', [ Validators.required, Validators.email ]);
  
  public allCriteria = [];

  matcher = new MyErrorStateMatcher();
  user = new User();

  constructor(public dialogRef: MatDialogRef<ModalComponent>,
    public _cacheService: CacheService,
    public donorService: DonorService,
    public sectorService: SectorService,
    public projectService: ProjectService,
    public criteriaService: CriteriaService,
    public modalitiesService: ModalitiesService,
    public snackBar: MatSnackBar,
    public userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }

  ngOnInit() {
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.modal != GlobalText.TEXTS) {
      this.modal = GlobalText.TEXTS;
    }
  }

  public closeDialog(): void {
    this.dialogRef.close(true);
  }

  /**
   * load data for selects
   */
  loadData(updateObject?) {
    if ((this.newObject && this.newObject.sectors) || (this.data.data && this.data.data.sectors)) {
      this.loadedData.sectors_name = this._cacheService.get(CacheService.SECTORS);
      if (!this.loadedData.sectors)
        this.sectorService.get().subscribe(response => {
          this.loadedData.sectors_name = response;
          this._cacheService.set(CacheService.SECTORS, this.loadedData.sectors_name);
        });
    }
    if ((this.newObject && this.newObject.donors) || (this.data.data && this.data.data.donors)) {
      this.loadedData.donors_name = this._cacheService.get(CacheService.DONORS);
      if (!this.loadedData.donors_name)
        this.donorService.get().subscribe(response => {
          this.loadedData.donors_name = response;
          this._cacheService.set(CacheService.DONORS, this.loadedData.donors_name);
        });
    }
    if ((this.data.data && this.data.data.projects)) {
      this.loadedData.projects_name = this._cacheService.get(CacheService.PROJECTS);
      if (!this.loadedData.projects)
        this.projectService.get().subscribe(response => {
          this.loadedData.projects_name = response;
          this._cacheService.set(CacheService.PROJECTS, this.loadedData.projects_name);
        });
    }
    
    //Distribution in projects
    if((updateObject && updateObject.date_distribution && updateObject.location_name && updateObject.name && updateObject.updated_on)){
      this.loadedData.type = [
        {
          'id': '0',
          'name': 'Households'
        },
        {
          'id': '1',
          'name': 'Beneficiaries'
        }
      ]
    }

    //User in settings
    if((this.newObject && this.newObject.password == '') || (updateObject && updateObject.email && updateObject.rights)){
      this.loadedData.rights = this.user.getAllRights();
      this.projectService.get().subscribe(response => {
        this.loadedData.projects = response;
      });
    }
    
    //Country specific option in settings
    if((this.newObject && this.newObject.countryIso3 == '' && this.newObject.field == '' && this.newObject.name == '') || (updateObject && updateObject.field && updateObject.type)){
      this.loadedData.type = [
        {
          'id': "text",
          'name': 'text',
        },
        {
          'id': "number",
          'name': 'number',
        }
      ]
    }
    
    if(this.newObject && this.newObject.field_string == ''){
      // this.allCriteria = this._cacheService.get(CacheService.CRITERIAS);
      if(this.allCriteria.length === 0 )
        this.criteriaService.get().subscribe(response => {
          this.allCriteria  = response;
          this.loadedData.field_string = [];
          this._cacheService.set(CacheService.CRITERIAS, this.loadedData.field_string);
        });
    }

    //for criterias
    if (this.newObject && this.newObject.kind_beneficiary == '') {
      this.loadedData.kind_beneficiary = [{ "field_string": this.modal.model_criteria_beneficiary }, { "field_string": this.modal.model_criteria_household }];
    }

    if (this.newObject && this.newObject.modality == '') {
      this.loadedData.modality = this._cacheService.get(CacheService.COMMODITY);
      if (!this.loadedData.modality) {
        this.modalitiesService.getModalities().subscribe(response => {
            this.loadedData.modality = response;
            for(let i=0; i<this.loadedData.modality.length; i++) {
                if(this.loadedData.modality[i].name == 'CTP') {
                    this.loadedData.modality[i].name = 'Cash';
                }
            }
            this._cacheService.set(CacheService.COMMODITY, this.loadedData.modality);
        })
      }
    }
  }

  /**
     * Recover the right from the model
     * @param element
     */
    recoverRights(element) {
      if (element.rights) {
          let re = /\ /gi;
          element.rights = element.rights.replace(re, "");
          let finalRight;

          this.entityInstance.getAllRights().forEach(rights => {
              let value = Object.values(rights);
              if (value[0] == element.rights) {
                  finalRight = value[1];
              }
          });

          return finalRight;
      }
  }
}
/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}