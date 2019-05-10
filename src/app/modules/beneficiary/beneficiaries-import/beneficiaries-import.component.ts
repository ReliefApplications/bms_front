import { Component, HostListener, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationService } from 'src/app/core/api/location.service';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Household } from 'src/app/model/household';
import { Adm, Location } from 'src/app/model/location';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { ProjectService } from '../../../core/api/project.service';
import { ImportService } from '../../../core/utils/beneficiaries-import.service';
import { Project } from '../../../model/project';
import { User } from 'src/app/model/user';


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
export class BeneficiariesImportComponent implements OnInit, OnDestroy {
    public nameComponent = 'beneficiaries_import_title';
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
        projects: new FormControl({ value: undefined, disabled: true}, Validators.required),
    });

    public fileForm = new FormGroup({
        projects: new FormControl({ value: undefined, disabled: true }, Validators.required),
    });

    // Syria template conversion
    private conversionDialog: MatDialogRef<any, any>;
    public conversionLocation = new Location();
    public conversionForm = new FormGroup({
        adm1: new FormControl(undefined, [Validators.required]),
        adm2: new FormControl(),
        adm3: new FormControl(),
        adm4: new FormControl(),
    });
    conversionFormControlSubscriptions: Array<Subscription>;

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
    private apiSelectorSubscriber: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public _householdsService: HouseholdsService,
        public _importService: ImportService,
        public _projectService: ProjectService,
        public _beneficiariesService: BeneficiariesService,
        private router: Router,
        public snackbar: SnackbarService,
        private _cacheService: AsyncacheService,
        private dialog: MatDialog,
        private locationService: LocationService,
        private userService: UserService,
        private languageService: LanguageService,
    ) { }

    ngOnInit() {

        if (!this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT')) {
            this.snackbar.error(this.language.forbidden_message);
            this.router.navigate(['']);
        } else {
            this.getProjects();
            this.getAPINames();
            this.extensionType = 'xls';
        }

        this._cacheService.get('country')
            .subscribe(
                result => {
                    this.country = result;
                }
            );

        this._cacheService.getUser()
            .subscribe(
                response => {
                    const user = User.apiToModel(response);
                    this.email = user.get('username');
                    this.email = this.email.replace('@', '');
                }
            );
    }

    ngOnDestroy(): void {
        if (this.apiSelectorSubscriber) {
            this.apiSelectorSubscriber.unsubscribe();
        }
    }

    /**
     * Get list of all project and put it in the project selector
     */
    getProjects() {
        this._projectService.get().subscribe((response: any) => {
            this.projectList = response.map((project: any) => Project.apiToModel(project));
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

    public openConversionDialog(template: TemplateRef<void>) {
        this.conversionForm.reset();



        this.conversionFormControlSubscriptions = Object.keys(this.conversionForm.controls).map((admKey: string) => {
            return this.conversionForm.controls[admKey].valueChanges.subscribe((_: any) => {
                this.onAdmChange(admKey);
            });
        });

        this.locationService.getAdm1().subscribe((adm1: Array<any>) => {
            this.conversionLocation.setOptions('adm1', adm1.map((singleAdm1: any) => Adm.apiToModel(singleAdm1)));
            this.conversionDialog = this.dialog.open(template);

            this.conversionDialog.afterClosed().subscribe((_: any) => {
                this.conversionFormControlSubscriptions.forEach((subscription: Subscription) => {
                    subscription.unsubscribe();
                });
            });
        });
    }

    public closeConversionDialog(method: string, error?: string) {
        this.conversionDialog.close();
        switch (method) {
            case 'cancel':
                this.snackbar.info(this.language.beneficiaries_import_canceled);
                return;
            case 'success':
                // Todo: translate
                this.snackbar.success('Import successful');
                return;
            case 'error':
                this.snackbar.error(error);
                return;
        }
    }

    onAdmChange(admKey: string) {
        switch (admKey) {
            case('adm4'):
                this.conversionLocation.set('adm4', this.conversionForm.get('adm4').value);

                return;
            case('adm3'):
                this.conversionLocation.set('adm3', this.conversionForm.get('adm3').value);
                this.locationService.getAdm4({adm3: this.conversionLocation.get('adm3').get('id')}).subscribe((adm4: Array<any>) => {
                    this.conversionLocation.setOptions('adm4', adm4.map((singleAdm4: any) => Adm.apiToModel(singleAdm4)));
                });
                return;
            case('adm2'):
                this.conversionLocation.set('adm2', this.conversionForm.get('adm2').value);
                this.locationService.getAdm3({adm2: this.conversionLocation.get('adm2').get('id')}).subscribe((adm3: Array<any>) => {
                    this.conversionLocation.setOptions('adm3', adm3.map((singleAdm3: any) => Adm.apiToModel(singleAdm3)));
                });
                return;
            case('adm1'):
                this.conversionLocation.set('adm1', this.conversionForm.get('adm1').value);
                this.locationService.getAdm2({adm1: this.conversionLocation.get('adm1').get('id')}).subscribe((adm2: Array<any>) => {
                    this.conversionLocation.setOptions('adm2', adm2.map((singleAdm2: any) => Adm.apiToModel(singleAdm2)));
                });
                return;
            default:
                return;
        }
    }

    confirmConversion() {
        if (!this.conversionForm.valid) {
            this.snackbar.error(this.language.beneficiaries_import_select_location);
            return;
        }

        if (!this.csv2 ) {
            this.snackbar.error(this.language.beneficiaries_import_error_file);
            return;
        }

        const data = new FormData();
        data.append('file', this.csv2);


        const body = {
            adm: 0,
            name: ''
        };

        if (this.conversionLocation.get<Adm>('adm4')) {
            body.adm = 4;
            body.name = this.conversionLocation.get<Adm>('adm4').get<string>('name');
        }
        else if (this.conversionLocation.get<Adm>('adm3')) {
            body.adm = 3;
            body.name = this.conversionLocation.get<Adm>('adm3').get<string>('name');

        }
        else if (this.conversionLocation.get<Adm>('adm2')) {
            body.adm = 2;
            body.name = this.conversionLocation.get<Adm>('adm2').get<string>('name');

        }
        else if (this.conversionLocation.get<Adm>('adm1')) {
            body.adm = 1;
            body.name = this.conversionLocation.get<Adm>('adm1').get<string>('name');
        }

        this._householdsService.testFileTemplate(data, body)
            .then(() => {
                this.closeConversionDialog('success');
            }, (error) => {
                this.closeConversionDialog('error', error);
                this.csv2 = null;
            })
            .catch(
                (error: any) => {
                    this.closeConversionDialog('error', error);
                    this.csv2 = null;
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

    /**
     * Recover all the API available for the actual country
     */
    getAPINames() {
        this._beneficiariesService.listApi()
            .subscribe((response: object) => {
                if (!response['listAPI'].length) {
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
    importHouseholdsFile() {
        if (!this.csv || !this.fileForm.controls['projects'].valid || this.load) {
            this.snackbar.error(this.language.beneficiaries_import_select_project);
        } else {
            this.load = true;
            this._importService.sendCsv(this.csv, this.email, this.fileForm.controls['projects'].value).subscribe((response: any) => {
                this._importService.setResponse(response);
                this.load = false;
                this.router.navigate(['/beneficiaries/import/data-validation']);
            }, (error: any) => {
                this.load = false;
            });
        }
    }

    /**
     * Check if all fields are set, and import all the beneficiaries
     */
    importHousholdsApi() {
        this.load = true;
        if (!this.apiForm.valid) {
            this.snackbar.error(this.language.beneficiaries_import_check_fields);
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
                    this.newHouseholds = response.map((household: Household) => Household.apiToModel(household));
                    this._importService.importedHouseholds = this.newHouseholds;
                    this.router.navigate(['/beneficiaries/imported']);
                    this.load = false;
                    this.snackbar.success(response.message + this.language.beneficiaries_import_beneficiaries_imported);
                }
            );
    }
}
