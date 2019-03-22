import { Component, OnInit, HostListener, DoCheck, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSnackBar } from '@angular/material';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { CountrySpecificService } from '../../core/api/country-specific.service';

import { Mapper } from '../../core/utils/mapper.service';
import { Donor } from '../../model/donor';
import { Project as NewProject } from '../../model/project.new';
import { User } from '../../model/user';
import { CountrySpecific } from '../../model/country-specific';

import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';

import { GlobalText } from '../../../texts/global';
import { SettingsService } from '../../core/api/settings.service';
import { finalize } from 'rxjs/operators';
import { LocationService } from 'src/app/core/api/location.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { FinancialProvider } from 'src/app/model/financial-provider';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { Project } from 'src/app/model/project';
import { TableComponent } from 'src/app/components/table/table.component';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, DoCheck {
    public nameComponent = 'settings';
    public settings = GlobalText.TEXTS;
    loadingExport = false;

    selectedTitle = '';
    loadingData = true;

    public referedClassService;
    referedClassToken;
    referedClassInstance: any;
    data: Array<CustomModel>;
    public user_action = '';
    public extensionType;

    // logs
    userLogForm = new FormControl();
    private selectedUserId: number = null;

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public language = GlobalText.language;
    public heightScreen;
    public widthScreen;
    hasRights: boolean;
    public deletable = true;

    @ViewChild(TableComponent) table: TableComponent;

    constructor(
        public dialog: MatDialog,
        public mapperService: Mapper,
        public authenticationService: AuthenticationService,
        public distributionService: DistributionService,
        public donorService: DonorService,
        public projectService: ProjectService,
        public userService: UserService,
        public countrySpecificService: CountrySpecificService,
        public financialProviderService: FinancialProviderService,
        private _cacheService: AsyncacheService,
        private locationService: LocationService,
        private _settingsService: SettingsService,
        private snackBar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.checkSize();
        this.selectTitle('users');
        this.extensionType = 'xls';
    }

    /**
	 * check if the langage has changed
	 */
    ngDoCheck() {
        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
            this.settings = GlobalText.TEXTS;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    selectTitle(title: string): void {
        this.selectedTitle = title;
        this.getData(title);
    }

    setType(choice) {
        this.extensionType = choice;
    }

    export() {
        let category: string;
        let country = null;
        this.loadingExport = true;

        switch (this.selectedTitle) {
            case 'users':
                category = 'users';
                break;
            case 'country specific options':
                category = 'countries';
                break;
            case 'donors':
                category = 'donors';
                break;
            case 'projects':
                category = 'projects';
                break;
            case 'financialProvider':
                category = 'financialProvider';
                break;
            default:
                break;
        }

        if (category === 'projects') {
            let exported = false;
            country = this.locationService.getAdm1().subscribe(
                result => {
                    if (!exported) {
                        exported = true;

                        country = result[0].country_i_s_o3;
                        return this._settingsService.export(this.extensionType, category, country).then(
                            () => { this.loadingExport = false; }
                        ).catch(
                            () => { this.loadingExport = false; }
                        );
                    }
                }
            );
        } else {
            return this._settingsService.export(this.extensionType, category, country).then(
                () => { this.loadingExport = false; }
            ).catch(
                () => { this.loadingExport = false; }
            );
        }
    }

    getData(title) {
        switch (title) {
            case 'users':
                this.referedClassToken = User;
                this.referedClassService = this.userService;
                this.deletable = true;
                break;
            case 'donors':
                this.referedClassToken = Donor;
                this.referedClassService = this.donorService;
                this.deletable = true;
                break;
            case 'projects':
                this.referedClassToken = NewProject;
                this.referedClassService = this.projectService;
                this.deletable = true;
                break;
            case 'country specific options':
                this.referedClassToken = CountrySpecific;
                this.referedClassService = this.countrySpecificService;
                this.deletable = true;
                break;
            case 'financialProvider':
                this.referedClassToken = FinancialProvider;
                this.referedClassService = this.financialProviderService;
                this.deletable = false;
                break;
            default: break;
        }
        this.load(title);
    }

    // TO DO : get from cache
    load(title): void {
        this.hasRights = false;

        this.referedClassService.get()
            .pipe(
                finalize(
                    () => {
                        this.loadingData = false;
                    }
                )
            ).subscribe(response => {

            const instances = [];
            if (response.length !== 0) {
                for (const item of response ) {
                    instances.push(this.referedClassToken.apiToModel(item));
                }
                this.data = instances;
            }

                    this._cacheService.getUser().subscribe(
                        result => {
                            if (result && result.rights) {
                                const rights = result.rights;
                                // TODO: Replace permissions with service (#430)
                                if (this.referedClassToken.rights.includes(rights)) {
                                    this.hasRights = true;
                                }
                            }
                        });

        this.table.checkData();

        this.loadingData = false;
        });
    }

    /**
	* open each modal dialog
	*/
    openDialog(user_action): void {
        let dialogRef;

        if (user_action === 'add') { } {
            this.referedClassInstance = new this.referedClassToken();
            this.referedClassService.fillWithOptions(this.referedClassInstance);

            dialogRef = this.dialog.open(ModalAddComponent, {
                data: {
                    objectInstance: this.referedClassInstance,
                 }
            });
        }
        // const create = dialogRef.componentInstance.onCreate.subscribe((data) => {
        //     if (this.referedClassToken.__classname__ === 'Project') {
        //         let exists = false;

        //         this.data.data.forEach(element => {
        //             if (element.name.toLowerCase() === data.name.toLowerCase()) {
        //                 this.snackBar.open(this.settings.settings_project_exists, '', { duration: 5000, horizontalPosition: 'center' });
        //                 exists = true;
        //                 return;
        //             }
        //         });

        //         if (exists === false) {
        //             this.createElement(data);
        //         }
        //     } else {
        //         this.createElement(data);
        //     }
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //     create.unsubscribe();
        // });
    }

    createElement(createElement: Object) {
        createElement = this.referedClassToken.formatForApi(createElement);
        if (this.referedClassToken.__classname__ !== 'User') {
            this.referedClassService.create(createElement['id'], createElement).subscribe(
                response => {
                    this.selectTitle(this.selectedTitle);
                });
        } else {
            // for users, there are two step (one to get the salt and one to create the user)
            this.authenticationService.initializeUser(createElement['username']).subscribe(response => {
                if (response) {
                    if (createElement['rights'] === 'ROLE_PROJECT_MANAGER'
                        || createElement['rights'] === 'ROLE_PROJECT_OFFICER'
                        || createElement['rights'] === 'ROLE_FIELD_OFFICER') {
                        delete createElement['country'];
                    } else if (createElement['rights'] === 'ROLE_REGIONAL_MANAGER'
                        || createElement['rights'] === 'ROLE_COUNTRY_MANAGER'
                        || createElement['rights'] === 'ROLE_READ_ONLY') {
                        delete createElement['projects'];
                    } else {
                        delete createElement['country'];
                        delete createElement['projects'];
                    }

                    this.authenticationService.createUser(createElement, response).subscribe(
                        () => {
                            this.selectTitle(this.selectedTitle);
                        });
                }
            });
        }
    }
}
