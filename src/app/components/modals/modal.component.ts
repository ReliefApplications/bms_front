import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { map } from 'rxjs/operators';
import { BookletService } from 'src/app/core/api/booklet.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { LocationService } from 'src/app/core/api/location.service';
import { VoucherService } from 'src/app/core/api/voucher.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { CriteriaService } from '../../core/api/criteria.service';
import { DonorService } from '../../core/api/donor.service';
import { ModalitiesService } from '../../core/api/modalities.service';
import { ProjectService } from '../../core/api/project.service';
import { SectorService } from '../../core/api/sector.service';
import { UploadService } from '../../core/api/upload.service';
import { UserService } from '../../core/api/user.service';
import { User } from '../../model/user';



/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

    public entityInstance = null;
    public properties: any;
    propertiesTypes: any;
    public loadedData: any = [];
    newObject: any;
    public controls = new FormControl();

    public passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
    public individualValuesRegex =  /^([\d]+,?\s?,?\s?)+$/;

    public defaultValue: FormControl = new FormControl({ value: ''});
    public projectsControl: FormControl = new FormControl({ value: '', disabled: 'true' });
    public countryControl: FormControl = new FormControl({ value: '', disabled: 'true' });

    public emailFormControl = new FormControl('', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change',
    });

    public passwordFormControl = new FormControl('', {
        validators: [Validators.required, Validators.pattern(this.passwordRegex)],
        updateOn: 'change',
    });

    public individualValuesFormControl = new FormControl('', {
        validators: [Validators.required, Validators.pattern(this.individualValuesRegex)],
        updateOn: 'change',
    });

    public notesFormControl = new FormControl(null, Validators.required);

    form = new FormGroup({
        defaultValue: this.defaultValue,
        projectsControl: this.projectsControl,
        countryControl: this.countryControl,
        emailFormControl: this.emailFormControl,
        passwordFormControl: this.passwordFormControl,
        notesFormControl: this.notesFormControl,
        individualValuesFormControl: this.individualValuesFormControl
    });

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    public allCriteria = [];

    matcher = new MyErrorStateMatcher();
    user = new User();


    public provinceList: any[];
    public districtList: any[];
    public communeList: any[];
    public villageList: any[];


    constructor(public dialogRef: MatDialogRef<ModalComponent>,
        public _cacheService: AsyncacheService,
        public donorService: DonorService,
        public sectorService: SectorService,
        public projectService: ProjectService,
        public criteriaService: CriteriaService,
        public modalitiesService: ModalitiesService,
        public snackbar: SnackbarService,
        public userService: UserService,
        public uploadService: UploadService,
        public distributionService: DistributionService,
        public bookletService: BookletService,
        public dialog: MatDialog,
        protected languageService: LanguageService,
        public voucherService: VoucherService,
        private locationService: LocationService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }




    public closeDialog(): void {
        this.dialogRef.close(true);
    }

    /**
     * load data for selects
     */
    loadData(updateObject?) {
        if ((this.newObject && this.newObject.sectors) || (this.data.data && this.data.data.sectors)) {
            this.sectorService.get().subscribe(
                result => {
                    this.loadedData.sectors_name = result;
                }
            );

        }
        if ((this.newObject && this.newObject.donors) || (this.data.data && this.data.data.donors)) {
            this.donorService.get().subscribe(
                result => {
                    this.loadedData.donors_name = result;
                }
            );
        }
        if ((this.data.data && this.data.data.projects)) {
            this.projectService.get().subscribe(
                result => {
                    this.loadedData.projects_name = result;
                }
            );
        }

        // Distribution in projects
        if ((updateObject && updateObject.date_distribution && updateObject.location_name
          && updateObject.name && updateObject.updated_on)) {
            this.loadedData.type = [
                {
                    'id': '0',
                    'name': 'Households'
                },
                {
                    'id': '1',
                    'name': 'Beneficiaries'
                }
            ];
        }

        // User in settings
        if ((this.newObject && this.newObject.password === '') || (updateObject && updateObject.email && updateObject.rights)) {
            // this.loadedData.rights = this.user.getAllRights();
            // this.loadedData.country = this.user.getAllCountries();
            this.projectService.get().subscribe(response => {
                this.loadedData.projects = response;
            });
        }

        // Country specific option in settings
        if ((this.newObject && this.newObject.countryIso3 === '' && this.newObject.field === '' &&
        this.newObject.name === '') || (updateObject && updateObject.field && updateObject.type)) {
            this.loadedData.type = [
                {
                    'id': 'text',
                    'name': 'text',
                },
                {
                    'id': 'number',
                    'name': 'number',
                }
            ];
        }

        if (this.newObject && this.newObject.field_string === '') {
            // this.allCriteria = this._cacheService.get(AsyncacheService.CRITERIAS);
            if (this.allCriteria.length === 0) {
                this.criteriaService.get().subscribe(response => {
                    this.allCriteria = response;
                    this.loadedData.field_string = [];
                });
            }
        }

        // for criterias
        if (this.newObject && this.newObject.kind_beneficiary === '') {
            this.loadedData.kind_beneficiary = [
                { 'field_string': this.language.beneficiary },
                { 'field_string': this.language.households }
            ];
        }

        // for commodities
        if (this.newObject && this.newObject.modality === '') {
            this.modalitiesService.getModalities().subscribe(
                response => {
                    this.loadedData.modality = response;
                    if (response) {
                        for (let i = 0; i < this.loadedData.modality.length; i++) {
                            if (this.loadedData.modality[i].name === 'CTP') {
                                this.loadedData.modality[i].name = 'Cash';
                            }
                        }
                    }
                }
            );
        }

       if (this.data.entity.__classname__ === 'Booklet') {
            this.voucherService.getCurrencies().subscribe(currencies => {
                this.loadedData['currency'] = Object.keys(currencies);
            });
       }
    }

    /**
       * Recover the right from the model
       * @param element
       */
    recoverRights(element) {
        if (element.rights) {
            const re = /\ /gi;
            element.rights = element.rights.replace(re, '');
            let finalRight;

            this.entityInstance.getAllRights().forEach(rights => {
                const value = Object.values(rights);
                if (value[0] === element.rights) {
                    finalRight = value[1];
                }
            });

            return finalRight;
        }
    }

     /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        return this.locationService.getAdm1().pipe(
            map(response => {
                this.provinceList = response.map(province => {
                    return {
                        id: province.id,
                        name: province.name
                    };
                });
                this.districtList = [];
                this.communeList = [];
                this.villageList = [];
        }));
    }

    /**
     *  Get adm2 from the back or from the cache service with the key ADM2
     * @param adm1
     */
    loadDistrict(adm1Name) {
        const adm1Id = this.provinceList.filter(province => {
            return province.name === adm1Name;
        })[0].id;
        const body = {
            adm1: adm1Id
        };
        return this.locationService.getAdm2(body).pipe(
            map(response => {
                this.districtList = response.map(district => {
                    return {
                        id: district.id,
                        name: district.name
                    };
                });
                this.communeList = [];
                this.villageList = [];
        }));
    }

    /**
     * Get adm3 from the back or from the cahce service with the key ADM3
     * @param adm2
     */
    loadCommunity(adm2Name) {
        const adm2Id = this.districtList.filter(district => {
            return district.name === adm2Name;
        })[0].id;
        const body = {
            adm2: adm2Id
        };
        return this.locationService.getAdm3(body).pipe(
            map(response => {
                this.communeList = response.map(commune => {
                    return {
                        id: commune.id,
                        name: commune.name
                    };
                });
                this.villageList = [];
        }));
    }

    /**
     *  Get adm4 from the back or from the cahce service with the key ADM4
     * @param adm3
     */
    loadVillage(adm3Name) {
        const adm3Id = this.communeList.filter(commune => {
            return commune.name === adm3Name;
        })[0].id;
        const body = {
            adm3: adm3Id
        };
        return this.locationService.getAdm4(body).pipe(
            map(response => {
                this.villageList = response.map(village => {
                    return {
                        id: village.id,
                        name: village.name
                    };
                });
        }));
    }
}
