import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { HouseholdsService } from '../../../core/api/households.service';

import { saveAs } from 'file-saver/FileSaver';
import { ImportService } from '../../../core/utils/import.service';
import { ProjectService } from '../../../core/api/project.service';
import { BeneficiariesService } from '../../../core/api/beneficiaries.service';
import { FormControl, Validators } from '@angular/forms';
import { Project } from '../../../model/project';
import { GlobalText } from '../../../../texts/global';
import { Router } from '@angular/router';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Households } from 'src/app/model/households';
import { ImportedDataService } from 'src/app/core/utils/imported-data.service';

@Component({
    selector: 'beneficiaries-import',
    templateUrl: './beneficiaries-import.component.html',
    styleUrls: ['./beneficiaries-import.component.scss']
})
export class BeneficiariesImportComponent implements OnInit {
    public nameComponent = 'beneficiaries_import_title';
    public language = GlobalText.language;
    public household = GlobalText.TEXTS;
    loadingExport = false;

    // for the items button
    selectedTitle = 'file import';
    isBoxClicked = false;

    // for the selector
    projects = new FormControl();
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

    constructor(
        public _householdsService: HouseholdsService,
        public _importService: ImportService,
        public _projectService: ProjectService,
        public _beneficiariesService: BeneficiariesService,
        private router: Router,
        public snackBar: MatSnackBar,
        private _cacheService: AsyncacheService,
        private importedDataService: ImportedDataService,
    ) { }

    ngOnInit() {
        let voters;
        this._cacheService.get('user').subscribe(
            result => {
                voters = result.voters;
                if (voters != "ROLE_ADMIN" && voters != 'ROLE_PROJECT_MANAGER' && voters != "ROLE_PROJECT_OFFICER") {
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
        else if(this.language !== GlobalText.language) {
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
    fileChange(event, typeEvent) {
        let fileList: FileList;

        switch (typeEvent) {
            case 'dataTransfer': fileList = event.dataTransfer.files; break;
            case 'target': fileList = event.target.files; break;
            default: break;
        }

        if (fileList.length > 0) {
            this.csv = fileList[0];
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
     * Get the project selected in the projectList selector
     * @param event
     */
    getProjectSelected(event) {
        this.selectedProject = event.value;
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
            const project = this.selectedProject.split(' - ');
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

                    this.router.navigate(['/beneficiaries/imported/data']);
                }
            );
    }
}