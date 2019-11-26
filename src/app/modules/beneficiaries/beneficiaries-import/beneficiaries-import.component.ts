import { Component, HostListener, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/api/user.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Household } from 'src/app/models/household';
import { Adm, Location } from 'src/app/models/location';
import { User } from 'src/app/models/user';
import { ImportService } from '../../../core/api/beneficiaries-import.service';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { HouseholdsService } from '../../../core/api/households.service';
import { ProjectService } from '../../../core/api/project.service';
import { Project } from '../../../models/project';

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
        projects: new FormControl({ value: undefined, disabled: true }, Validators.required),
    });

    public fileForm = new FormGroup({
        projects: new FormControl({ value: undefined, disabled: true }, Validators.required),
    });

    // Syria template conversion
    private conversionDialog: MatDialogRef<any, any>;
    public conversionLocation = new Location();
    public conversionForm = new FormGroup({});
    conversionFormControlSubscriptions: Array<Subscription>;
    loadingConversion = false;

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

    public apiList: Array<Api> = [];
    public selectedApi: Api;
    private apiSelectorSubscriber: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;
    public countryId = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');

    constructor(
        public householdsService: HouseholdsService,
        public importService: ImportService,
        public projectService: ProjectService,
        public beneficiariesService: BeneficiariesService,
        private router: Router,
        public snackbar: SnackbarService,
        private cacheService: AsyncacheService,
        private dialog: MatDialog,
        private userService: UserService,
        private languageService: LanguageService,
        private countryService: CountriesService,
    ) { }

    ngOnInit() {
        if (!this.userService.hasRights('ROLE_BENEFICIARY_MANAGEMENT_WRITE')) {
            this.snackbar.error(this.language.forbidden_message);
            this.router.navigate(['']);
        } else {
            this.getProjects();
            this.getAPINames();
            this.extensionType = 'xls';
        }

        this.cacheService.getUser()
            .subscribe(
                (user: User) => {
                    if (user) {
                        this.email = user.get('username');
                        this.email = this.email.replace('@', '');
                    }
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
        this.projectService.get().subscribe((response: any) => {
            if (response) {
                this.projectList = response.map((project: any) => Project.apiToModel(project));
            }
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
        this.householdsService.exportTemplate(this.extensionType).subscribe(
            () => { this.loadingExport = false; },
            (_error: any) => { this.loadingExport = false; }
        );
    }

    public openConversionDialog(template: TemplateRef<void>) {
        this.conversionForm.reset();
        this.conversionDialog = this.dialog.open(template);
    }

    public closeConversionDialog(method: string, error?: string) {
        this.loadingConversion = false;
        this.conversionDialog.close();
        switch (method) {
            case 'cancel':
                this.snackbar.info(this.language.beneficiary_import_canceled);
                return;
            case 'success':
                // Todo: translate
                this.snackbar.success(this.language.beneficiary_import_conversion_success);
                return;
            case 'error':
                this.snackbar.error(error);
                return;
        }
    }

    confirmConversion() {
        this.loadingConversion = true;
        if (!this.conversionForm.valid) {
            this.snackbar.error(this.language.beneficiary_import_select_location);
            return;
        }

        if (!this.csv2) {
            this.snackbar.error(this.language.beneficiary_import_error_file);
            return;
        }

        const data = new FormData();
        data.append('file', this.csv2);

        const body = {};
        ['adm1', 'adm2', 'adm3', 'adm4'].forEach((admName: string) => {
            const filter = this.conversionLocation.getOptions(admName)
                .filter((adm: Adm) => adm.get('id') === this.conversionForm.controls[admName].value);
            body[admName] = filter.length ? filter[0].get('name') : '';
        });

        this.householdsService.testFileTemplate(data, body).subscribe(
            () => { this.closeConversionDialog('success'); },
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
        this.beneficiariesService.listApi()
            .subscribe((response: object) => {
                if (!response || !response['listAPI'].length) {
                    return;
                }
                response['listAPI'].map((apiInfo: any) => {
                    this.apiList.push({ name: apiInfo.APIName, parameters: apiInfo.params });
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
                    new FormControl(undefined, [Validators.pattern(/\w+/), Validators.required])
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
            this.snackbar.error(this.language.beneficiary_import_select_project);
        } else {
            this.load = true;
            this.importService.sendCsv(this.csv, this.email, this.fileForm.controls['projects'].value).subscribe((response: any) => {
                if (response) {
                    this.importService.setResponse(response);
                }
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
            this.snackbar.error(this.language.beneficiary_import_check_fields);
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


        this.beneficiariesService.importApi(body, this.apiForm.controls['projects'].value)
            .subscribe(response => {
                if (response) {
                    this.newHouseholds = response.households;
                }
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
        this.householdsService.getImported(this.newHouseholds)
            .subscribe(
                response => {
                    if (response) {
                        this.newHouseholds = response.map((household: Household) => Household.apiToModel(household));
                        this.snackbar.success(response.length + this.language.beneficiary_import_beneficiaries_imported);
                    }
                    this.importService.importedHouseholds = this.newHouseholds;
                    this.router.navigate(['/beneficiaries/imported']);
                    this.load = false;
                }
            );
    }
}
