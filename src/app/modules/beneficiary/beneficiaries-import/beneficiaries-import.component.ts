import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { HouseholdsService } from '../../../core/api/households.service';

import { saveAs } from 'file-saver/FileSaver';
import { ImportService } from '../../../core/utils/import.service';
import { ProjectService } from '../../../core/api/project.service';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Project } from '../../../model/project';
import { GlobalText } from '../../../../texts/global';
import { Router } from '@angular/router';
import { MatSnackBar, MatTableDataSource, MatDialog } from '@angular/material';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Households } from 'src/app/model/households';
import { ImportedDataService } from 'src/app/core/utils/imported-data.service';
import { LocationService } from 'src/app/core/api/location.service';
import { switchMap, finalize } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

@Component({
    selector: 'beneficiaries-import',
    templateUrl: './beneficiaries-import.component.html',
    styleUrls: ['./beneficiaries-import.component.scss', '../../../components/modals/modal.component.scss']
})
export class BeneficiariesImportComponent implements OnInit {
    public nameComponent = 'beneficiaries_import_title';
    public language = GlobalText.language;
    public household = GlobalText.TEXTS;
    loadingExport = false;

    // to disable / enable the second box
    public isProjectsDisabled = true;
    public isApiDisabled = true;

    // for the items button
    selectedTitle = 'file import';
    isBoxClicked = false;

    // for the selector
    form = new FormGroup({
        projects: new FormControl({ value: '', disabled: 'true' })
    });
    projectList: string[] = [];
    public selectedProject: string = null;

    // upload
    response = '';
    public csv = null;

    dragAreaClass = 'dragarea';


    referedClassToken = Project;
    public referedClassService;
    public project;
    public load = false;


    public APINames: string[] = [];
    public APIParams: any = [];
    public ParamsToDisplay: any = [];
    public chosenItem: string;

    public text = new FormControl('', [Validators.pattern('[a-zA-Z ]*'), Validators.required]);
    public number = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);
    public paramToSend = {};
    public provider: string;
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
    public loadLocations: boolean = false;
    public loadDownload: boolean = false;
    public country: boolean;

    public slides: Object[] =
    [
        {
            slideInfo: {icon: "folder", color: "green", title: this.household.beneficiaries_import_file, ref:"file import", selected: true},
        },
        {
            slideInfo: {icon: "settings/api", color: "red", title: this.household.beneficiaries_import_api, ref:"api import", selected: false}
        }
    ];

    constructor(
        public _householdsService: HouseholdsService,
        public _importService: ImportService,
        public _projectService: ProjectService,
        public _beneficiariesService: BeneficiariesService,
        private router: Router,
        public snackBar: MatSnackBar,
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
                if (rights != "ROLE_ADMIN" && rights != 'ROLE_PROJECT_MANAGER' && rights != "ROLE_PROJECT_OFFICER") {
                    this.snackBar.open(this.household.forbidden_message, '', { duration: 5000, horizontalPosition: 'center' });
                    this.router.navigate(['']);
                }
                else {
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
                    this.email = this.email.replace("@", '');
                }
            )
    }

    /**
   * check if the langage has changed
   */
    ngDoCheck() {
        if (this.household !== GlobalText.TEXTS) {
            this.household = GlobalText.TEXTS;
        }
        else if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this.referedClassService = this._projectService;
        this.referedClassService.get().subscribe(response => {
            this.projectList = [];
            response = this.referedClassToken.formatArray(response);
            response.forEach(element => {
                const concat = element.id + ' - ' + element.name;
                this.projectList.push(concat);
            });
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
            this.csv = fileList[0];
            this.isProjectsDisabled = false;
            if (this.projectList.length > 0) {
                this.form.controls['projects'].enable();
                this.selectedProject = this.projectList[0];
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
            () => { this.loadingExport = false }
        ).catch(
            () => { this.loadingExport = false }
        )
    }

    /**
     * Send csv file and project to import new households
     */
    addHouseholds() {
        const data = new FormData();
        if (!this.csv || !this.selectedProject || this.load) {
            this.snackBar.open(this.household.beneficiaries_import_select_project, '', { duration: 5000, horizontalPosition: 'center' });
        } else {
            const project = this.selectedProject.split(' - ');
            data.append('file', this.csv);
            const step = 1;
            this.load = true;
            this._importService.sendData(this.email, data, project[0], step).then(() => {
                this.router.navigate(['/beneficiaries/import/data-validation']);
            }, (err) => {
                this.load = false;
            })
                .catch(
                    () => {
                        this.load = false;
                        this.snackBar.open(this.household.beneficiaries_import_error_importing, '', { duration: 5000, horizontalPosition: 'center' });
                    }
                );
        }
    }

    /**
     * Open modal to select locations in the export file
     */
    selectLocations(template) {
        if (this.dialog.openDialogs.length == 0) {
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
                    return this.locationService.getAdm2(body)
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
                    return this.locationService.getAdm3(body)
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
                    return this.locationService.getAdm4(body)
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
        //console.log(this.loadedData);
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
        this.snackBar.open(message, '', { duration: 5000, horizontalPosition: 'center' });
        this.dialog.closeAll();
    }

    confirmImport() {
        if (!this.csv2 || this.saveLocation.adm1 == '')
            this.snackBar.open(this.household.beneficiaries_import_select_location, '', { duration: 5000, horizontalPosition: 'center' });

        const data = new FormData();
        data.append('file', this.csv2);


        let body = {
            adm: 0,
            name: ''
        };

        if (this.saveLocation.adm4 != '') {
            body.adm = 4;
            body.name = this.saveLocation.adm4;
        }
        else if (this.saveLocation.adm3 != '') {
            body.adm = 3;
            body.name = this.saveLocation.adm3;
        }
        else if (this.saveLocation.adm2 != '') {
            body.adm = 2;
            body.name = this.saveLocation.adm2;
        }
        else if (this.saveLocation.adm1 != '') {
            body.adm = 1;
            body.name = this.saveLocation.adm1;
        }

        this._importService.testFileTemplate(data, body)
            .then(() => {
            }, (err) => {
                this.dialog.closeAll();
                this.csv2 = null;
                this.snackBar.open(this.household.beneficiaries_import_response, '', { duration: 5000, horizontalPosition: 'center' });
            })
            .catch(
                () => {
                    this.dialog.closeAll();
                    this.csv2 = null;
                    this.snackBar.open(this.household.beneficiaries_import_error_importing, '', { duration: 5000, horizontalPosition: 'center' });
                });
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
    //Recover all the API available for the actual country
    getAPINames() {
        this._beneficiariesService.listApi()
            .subscribe(names => {
                if (names['listAPI'].length > 0) {
                    names = names['listAPI'];
                    let param = {};

                    Object.values(names).forEach(listAPI => {
                        this.APINames.push(listAPI['APIName']);

                        for (let j = 0; j < listAPI['params'].length; j++) {
                            if (listAPI['params'][j].paramType == 'string') {
                                param['paramType'] = "text";
                            }
                            else if (listAPI['params'][j].paramType == 'int') {
                                param['paramType'] = "number";
                            }

                            param['paramName'] = listAPI['params'][j].paramName;

                        }

                        this.APIParams.push(param);
                    });

                    this.chosenItem = this.APINames[0];
                    this.ParamsToDisplay.push({ 'paramType': this.APIParams[0].paramType, 'paramName': this.APIParams[0].paramName });
                    this.provider = this.chosenItem;
                    this.chosenItem ? this.isApiDisabled = false : 0;
                }
            });
    }

    //Get the index of the radiogroup to display the right inputs
    onChangeRadioAPI(event) {
        this.ParamsToDisplay = [];
        const index = this.APINames.indexOf(event.value);
        this.ParamsToDisplay.push({ 'paramType': this.APIParams[index].paramType, 'paramName': this.APIParams[index].paramName });
        this.provider = event.value;
    }

    //Get each value in inputs
    getValue(event, paramName) {
        const text = event.target.value;

        this.paramToSend["params"] = { [paramName]: text };
    }

    //Check if all fields are set, and import all the beneficiaries
    addBeneficiaries() {
        if (Object.keys(this.paramToSend).length == this.APIParams.length && Object.keys(this.paramToSend).length > 0) {
            if (this.selectedProject == null) {
                this.snackBar.open(this.household.beneficiaries_missing_selected_project, '', { duration: 5000, horizontalPosition: 'right' })
            } else {
                const project = this.selectedProject.split(' - ');
                this._importService.project = project[0];
                this.load = true;
                this.paramToSend['provider'] = this.provider;
                this._beneficiariesService.importApi(this.paramToSend, project[0])
                    .subscribe(response => {
                        if (response.error) {
                            this.load = false;
                            this.snackBar.open(response.error, '', { duration: 5000, horizontalPosition: 'right' });
                            delete this.paramToSend['provider'];
                        }
                        else if (response.exist) {
                            this.load = false;
                            this.snackBar.open(response.exist, '', { duration: 5000, horizontalPosition: 'right' });
                            delete this.paramToSend['provider'];
                        }
                        else {
                            this.snackBar.open(response.message + this.household.beneficiaries_import_beneficiaries_imported, '', { duration: 5000, horizontalPosition: 'right' });
                            this.newHouseholds = response.households;

                            this.importedHouseholds();
                        }
                    });
            }
        }
        else
            this.snackBar.open(this.household.beneficiaries_import_check_fields, '', { duration: 5000, horizontalPosition: 'right' });

    }


    //Get imported households
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
