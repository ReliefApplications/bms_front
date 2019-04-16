import { Component, DoCheck, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { LocationService } from 'src/app/core/api/location.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ImportedDataService } from 'src/app/core/utils/imported-data.service';
import { Households } from 'src/app/model/households';
import { GlobalText } from '../../../../texts/global';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { ProjectService } from '../../../core/api/project.service';
import { ImportService } from '../../../core/utils/beneficiaries-import.service';
import { Project } from '../../../model/project';


export interface Api {
    name: string;
    parameters: Array<ApiParameter>;
}

export interface ApiParameter {
    paramName: string;
    paramType: string;
}

@Component({
    selector: 'app-beneficiaries-import',
    templateUrl: './beneficiaries-import.component.html',
    styleUrls: ['./beneficiaries-import.component.scss', '../../../components/modals/modal.component.scss']
})
export class BeneficiariesImportComponent implements OnInit, DoCheck, OnDestroy {
    public nameComponent = 'beneficiaries_import_title';
    public language = GlobalText.language;
    public household = GlobalText.TEXTS;
    loadingExport = false;


    // for the items button
    selectedTitle = 'file import';
    isBoxClicked = false;

    projectList: Project[] = [];

    // upload
    response = '';
    public csv = null;

    dragAreaClass = 'dragarea';


    referedClassToken = Project;
    public referedClassService;
    public project;
    public load = false;

    public apiForm = new FormGroup({
        apiSelector: new FormControl(undefined, Validators.required),
        projects : new FormControl({ value: undefined, disabled: true}, Validators.required),
    });

    public fileForm = new FormGroup({
        projects : new FormControl({ value: undefined, disabled: true }, Validators.required),
    });

    extensionType: string;
    public newHouseholds: any = {};
    public email: string;

    public controls = new FormControl();
    public csv2 = null;
    public saveLocation = {
        adm1: '',
        adm2: '',
        adm3: '',
        adm4: ''
    };
    public loadedData = {
        adm1: [],
        adm2: [],
        adm3: [],
        adm4: []
    };

    public lastAdm1;
    public lastAdm2;
    public lastAdm3;
    public loadLocations = false;
    public loadDownload = false;
    public country: boolean;

    public apiList: Array<Api> = [];
    public selectedApi: Api;
    apiSelectorSubscriber: Subscription;

    constructor(
        public _householdsService: HouseholdsService,
        public _importService: ImportService,
        public _projectService: ProjectService,
        public _beneficiariesService: BeneficiariesService,
        private router: Router,
        public snackbar: SnackbarService,
        private _cacheService: AsyncacheService,
        private importedDataService: ImportedDataService,
        private dialog: MatDialog,
        private locationService: LocationService,
    ) { }

    ngOnInit() {
        let rights;

        this._cacheService.get('user').subscribe(
            result => {
                rights = result.rights;
                if (rights !== 'ROLE_ADMIN' && rights !== 'ROLE_PROJECT_MANAGER' && rights !== 'ROLE_PROJECT_OFFICER') {
                    this.snackbar.error(this.household.forbidden_message);
                    this.router.navigate(['']);
                } else {
                    this.getProjects();
                    this.getAPINames();
                    this.extensionType = 'xls';
                }
            }
        );

        this._cacheService.get('country')
            .subscribe(
                result => {
                    this.country = result;
                }
            );

        this._cacheService.getUser()
            .subscribe(
                response => {
                    this.email = response.username;
                    this.email = this.email.replace('@', '');
                }
            );

    }


    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.household !== GlobalText.TEXTS) {
            this.household = GlobalText.TEXTS;
        } else if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    ngOnDestroy(): void {
        this.apiSelectorSubscriber.unsubscribe();
    }

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this._projectService.get().subscribe((response: any) => {
            this.projectList = Project.formatArray(response);
            // this.form.controls['projects'].reset(this.projectList[0]);
        });
    }

    setType(choice: string) {
        this.extensionType = choice;
    }

    /**
     * Detect when the file change with the file browse or with the drag and drop
     * @param event
     * @param typeEvent
     */
    fileChange(event, typeEvent, index?: string) {
        let fileList: FileList;

        switch (typeEvent) {
            case 'dataTransfer': fileList = event.dataTransfer.files; break;
            case 'target': fileList = event.target.files; break;
            default: break;
        }

        if (fileList.length > 0) {
            if (index) {
                this.csv2 = fileList[0];
            } else {
                this.csv = fileList[0];

            }

            this.fileForm.controls['projects'].enable();
            if (this.projectList.length > 0) {
                this.fileForm.patchValue({
                    projects: this.projectList[0],
                });
            }
        }
    }

    /**
     * Detect which button item (file import or api import) is selected
     * @param title
     */
    selectTitle(title): void {
        this.isBoxClicked = true;
        this.selectedTitle = title;
    }

    /**
     * Get the csv template to import new household and ask
     * to save it or just to open it in the computer
     */
    exportTemplate() {
        this.loadingExport = true;
        this._householdsService.exportTemplate(this.extensionType).then(
            () => { this.loadingExport = false; }
        ).catch(
            () => { this.loadingExport = false; }
        );
    }

    /**
     * Open modal to select locations in the export file
     */
    selectLocations(template) {
        if (this.dialog.openDialogs.length === 0) {
            this.dialog.open(template);
        }
    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince(template) {
        this.loadLocations = true;

        this.locationService.getAdm1()
            .pipe(
                finalize(() => {
                    this.loadLocations = false;
                    this.selectLocations(template);
                })
            )
            .subscribe(response => {
                this.loadedData.adm1 = response;
            });
        this.loadedData.adm2 = [];
        this.loadedData.adm3 = [];
        this.loadedData.adm4 = [];
    }

    /**
     *  Get adm2 from the back or from the cache service with the key ADM2
     * @param adm1
     */
    loadDistrict(adm1$) {
        adm1$.pipe(
            switchMap(
                (value) => {
                    const body = {
                        adm1: value
                    };
                    return this.locationService.getAdm2(body);
                }
            )
        ).subscribe(response => {
            this.loadedData.adm2 = response;
            this.loadedData.adm3 = [];
            this.loadedData.adm4 = [];
        });
    }

    /**
     * Get adm3 from the back or from the cahce service with the key ADM3
     * @param adm2
     */
    loadCommunity(adm2$) {
        adm2$.pipe(
            switchMap(
                (value) => {
                    const body = {
                        adm2: value
                    };
                    return this.locationService.getAdm3(body);
                }
            )
        ).subscribe(response => {
            this.loadedData.adm3 = response;
            this.loadedData.adm4 = [];
        });
    }

    /**
     *  Get adm4 from the back or from the cahce service with the key ADM4
     * @param adm3
     */
    loadVillage(adm3$) {
        adm3$.pipe(
            switchMap(
                (value) => {
                    const body = {
                        adm3: value
                    };
                    return this.locationService.getAdm4(body);
                }
            )
        ).subscribe(response => {
            this.loadedData.adm4 = response;
        });
    }

    /**
     * Check which adm is selected to load the list of adm link to it
     * fro example : if adm1 (province) selected load adm2
     * @param index
     */
    selected(index) {
        let adm$;
        if (index === 'adm1') {
            adm$ = this.getAdmID('adm1');
            this.loadDistrict(adm$);
        } else if (index === 'adm2') {
            adm$ = this.getAdmID('adm2');
            this.loadCommunity(adm$);
        } else if (index === 'adm3') {
            adm$ = this.getAdmID('adm3');
            this.loadVillage(adm$);
        }
    }

    /**
     * Get in the cache service the name of all adm selected
     * @param adm
     */
    getAdmID(adm: string) {
        return new Observable(
            observer => {
                const body = {};
                if (adm === 'adm1') {
                    this.locationService.getAdm1().subscribe(
                        result => {
                            const adm1 = result;
                            if (this.saveLocation.adm1) {
                                for (let i = 0; i < adm1.length; i++) {
                                    if (adm1[i].name === this.saveLocation.adm1) {
                                        this.lastAdm1 = adm1[i].id;
                                        observer.next(adm1[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                } else if (adm === 'adm2') {
                    body['adm1'] = this.lastAdm1;
                    this.locationService.getAdm2(body).subscribe(
                        result => {
                            const adm2 = result;
                            if (this.saveLocation.adm2) {
                                for (let i = 0; i < adm2.length; i++) {
                                    if (adm2[i].name === this.saveLocation.adm2) {
                                        this.lastAdm2 = adm2[i].id;
                                        observer.next(adm2[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                } else if (adm === 'adm3') {
                    body['adm2'] = this.lastAdm2;
                    this.locationService.getAdm3(body).subscribe(
                        result => {
                            const adm3 = result;
                            if (this.saveLocation.adm3) {
                                for (let i = 0; i < adm3.length; i++) {
                                    if (adm3[i].name === this.saveLocation.adm3) {
                                        this.lastAdm3 = adm3[i].id;
                                        observer.next(adm3[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                } else if (adm === 'adm4') {
                    body['adm3'] = this.lastAdm3;
                    this.locationService.getAdm4(body).subscribe(
                        result => {
                            const adm4 = result;
                            if (this.saveLocation.adm4) {
                                for (let i = 0; i < adm4.length; i++) {
                                    if (adm4[i].name === this.saveLocation.adm4) {
                                        observer.next(adm4[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                }
            }
        );
    }

    /**
     * To cancel on a dialog
     */
    exit(message: string) {
        this.snackbar.info(message);
        this.dialog.closeAll();
    }

    confirmImport() {
        if (!this.csv2 || this.saveLocation.adm1 === '') {
            this.snackbar.error(this.household.beneficiaries_import_select_location);
        }

        const data = new FormData();
        data.append('file', this.csv2);


        const body = {
            adm: 0,
            name: ''
        };

        if (this.saveLocation.adm4 !== '') {
            body.adm = 4;
            body.name = this.saveLocation.adm4;
        } else if (this.saveLocation.adm3 !== '') {
            body.adm = 3;
            body.name = this.saveLocation.adm3;
        } else if (this.saveLocation.adm2 !== '') {
            body.adm = 2;
            body.name = this.saveLocation.adm2;
        } else if (this.saveLocation.adm1 !== '') {
            body.adm = 1;
            body.name = this.saveLocation.adm1;
        }
        // TODO Important: enable this
        // this._importService.testFileTemplate(data, body)
        //     .then(() => {
        //     }, (err) => {
        //         this.dialog.closeAll();
        //         this.csv2 = null;
        //         this.snackbar.info(this.household.beneficiaries_import_response);
        //     })
        //     .catch(
        //         () => {
        //             this.dialog.closeAll();
        //             this.csv2 = null;
        //             this.snackbar.error(this.household.beneficiaries_import_error_importing);
        //         });
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

    /************************************* API IMPORT  ******************************************************/

    /**
     * Recover all the API available for the actual country
     */
    getAPINames() {
        this._beneficiariesService.listApi()
            .subscribe((response: object) => {
                if (!response) {
                    this.snackbar.warning('NO API FOUND');
                    return;
                }
                response['listAPI'].map((apiInfo: any) => {
                    this.apiList.push({name: apiInfo.APIName, parameters: apiInfo.params});
                });

                this.listenForApiSelectorChanges();

                this.apiForm.patchValue({
                    apiSelector: this.apiList[0].name,
                });
            });
    }

    setSelectedApi(apiName: string): void {
        this.apiList.forEach((api: Api) => {
            if (api.name === apiName) {
                this.selectedApi = api;
                return;
            }
        });
    }

    listenForApiSelectorChanges() {
        this.apiSelectorSubscriber = this.apiForm.get('apiSelector').valueChanges.subscribe((apiName: string) => {
            this.setSelectedApi(apiName);
            this.updateParameterControl();
            this.apiForm.controls['projects'].enable();
        });
    }

    updateParameterControl() {
        const parametersFormGroup = new FormGroup({});
        this.selectedApi.parameters.forEach((parameter: ApiParameter) => {
            if (parameter.paramType === 'string') {
                parametersFormGroup.addControl(
                    parameter.paramName,
                    new FormControl( undefined, [Validators.pattern(/\w+/), Validators.required])
                    );
            } else if (parameter.paramType === 'int') {
                parametersFormGroup.addControl(
                    parameter.paramName,
                    new FormControl(undefined, [Validators.pattern(/\d+/), Validators.required])
                );
            }
        });
        if (this.apiForm.contains('parameters')) {
            this.apiForm.removeControl('parameters');
        }
        this.apiForm.addControl('parameters', parametersFormGroup);
        this.apiForm.controls['parameters'].enable();
    }


     /**
     * Send csv file and project to import new households
     */
    importHousholdsFile() {
        if (!this.csv || !this.fileForm.controls['projects'].valid || this.load) {
            this.snackbar.error(this.household.beneficiaries_import_select_project);
        } else {
            this.load = true;
            this._importService.setImportContext(this.email, this.fileForm.controls['projects'].value, this.csv);
            this.router.navigate(['/beneficiaries/import/data-validation']);
        }
    }

    /**
     * Check if all fields are set, and import all the beneficiaries
     */
    importHousholdsApi() {
        if (!this.apiForm.valid) {
            this.snackbar.error(this.household.beneficiaries_import_check_fields);
            return;
        }
        const params = {};
        this.selectedApi.parameters.forEach((parameter: ApiParameter) => {
            params[parameter.paramName] = this.apiForm.get(['parameters', parameter.paramName]).value;
        });

        const body = {
            params: params,
            provider: this.selectedApi.name,
        };


        this._beneficiariesService.importApi(body, this.apiForm.controls['projects'].value)
            .subscribe(response => {
                this.load = false;
                this.snackbar.success(response.message + this.household.beneficiaries_import_beneficiaries_imported);
                this.newHouseholds = response.households;
                this.importedHouseholds();
            }, error => {
                this.load = false;
                this.snackbar.error(error);
            });
    }

    /**
     * Get imported households
     */
    importedHouseholds() {
        this._householdsService.getImported(this.newHouseholds)
            .subscribe(
                response => {
                    this.newHouseholds = response;
                    this.newHouseholds = Households.formatArray(this.newHouseholds);
                    this.importedDataService.data = this.newHouseholds;
                    this.router.navigate(['/beneficiaries/imported']);
                }
            );
    }
}
