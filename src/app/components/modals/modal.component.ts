import { Component, OnInit, DoCheck, Input, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA, ErrorStateMatcher } from '@angular/material';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';

import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { SectorService } from '../../core/api/sector.service';

import { GlobalText } from '../../../texts/global';
import { CriteriaService } from '../../core/api/criteria.service';
import { ModalitiesService } from '../../core/api/modalities.service';
import { isArray } from 'util';
import { User } from '../../model/user';
import { UserService } from '../../core/api/user.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { UploadService } from '../../core/api/upload.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { BookletService } from 'src/app/core/api/booklet.service';

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
export class ModalComponent implements OnInit, DoCheck {
    public modal = GlobalText.TEXTS;
    public language = GlobalText.language;

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



    public allCriteria = [];

    matcher = new MyErrorStateMatcher();
    user = new User();

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
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
    }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.modal !== GlobalText.TEXTS) {
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
            this.loadedData.rights = this.user.getAllRights();
            this.loadedData.country = this.user.getAllCountries();
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
            this.loadedData.kind_beneficiary = [{ 'field_string': this.modal.beneficiary }, { 'field_string': this.modal.households }];
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
}
