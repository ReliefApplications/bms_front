import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSnackBar } from '@angular/material';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { CountrySpecificService } from '../../core/api/country-specific.service';

import { Mapper } from '../../core/utils/mapper.service';
import { Donor } from '../../model/donor';
import { Project } from '../../model/project';
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

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    public nameComponent = 'settings';
    public settings = GlobalText.TEXTS;
    loadingExport = false;

    selectedTitle = '';
    isBoxClicked = false;
                                               loadingData = true;

    public referedClassService;
    referedClassToken;
    data: MatTableDataSource<any>;
    public user_action = '';
    public extensionType;

    //logs
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
    public deletable: boolean = true;

    constructor
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

    selectTitle(title): void {
        this.getData(title);
        this.isBoxClicked = true;
        this.selectedTitle = title;
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
        // console.log('#####- ', category);
        if (category === 'projects') {
            let exported = false;
            country = this.locationService.getAdm1().subscribe(
                result => {
                    if (!exported) {
                        exported = true;

                        country = result[0].country_i_s_o3;
                        return this._settingsService.export(this.extensionType, category, country).then(
                            () => { this.loadingExport = false }
                        ).catch(
                            () => { this.loadingExport = false }
                        );
                    }
                }
            );
        } else {
            return this._settingsService.export(this.extensionType, category, country).then(
                () => { this.loadingExport = false }
            ).catch(
                () => { this.loadingExport = false }
            )
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
                this.referedClassToken = Project;
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

        this.referedClassService.get().
            pipe(
                finalize(
                    () => {
                        this.loadingData = false;
                    }
                )
            ).subscribe(response => {
                if (response) {
                    this.loadingData = false;
                    //console.log(response);
                    if (response && response[0] && response[0].email && response[0].username && response[0].roles)
                        response.forEach(element => {
                            element.projects = new Array<number>();
                            element.country = '';

                            for (let i = 0; i < element.user_projects.length; i++) {
                                element.projects[i] = element.user_projects[i].project.name;
                            }
                            for (let i = 0; i < element.countries.length; i++)
                                element.country = element.countries[i].iso3;
                        });

                    response = this.referedClassToken.formatArray(response);
                    this.data = new MatTableDataSource(response);

                    this._cacheService.getUser().subscribe(
                        result => {
                            if (result && result.rights) {
                                const rights = result.rights;

                                if (this.referedClassToken.__classname__ == 'User')
                                    if (rights == 'ROLE_ADMIN')
                                        this.hasRights = true;

                                if (this.referedClassToken.__classname__ == 'CountrySpecific')
                                    if (rights == "ROLE_ADMIN" || rights == 'ROLE_COUNTRY_MANAGER' || rights == 'ROLE_PROJECT_MANAGER')
                                        this.hasRights = true;

                                if (this.referedClassToken.__classname__ == 'Donor')
                                    if (rights == 'ROLE_ADMIN')
                                        this.hasRights = true;

                                if (this.referedClassToken.__classname__ == 'Project')
                                    if (rights == "ROLE_ADMIN" || rights == 'ROLE_COUNTRY_MANAGER' || rights == 'ROLE_PROJECT_MANAGER')
                                        this.hasRights = true;

                                if (this.referedClassToken.__classname__ == 'Financial Provider')
                                    if (rights == "ROLE_ADMIN")
                                        this.hasRights = true;
                            }
                        }
                    );

                } else {
                    this.data = new MatTableDataSource(null);
                    this.loadingData = false;
                }
            })
        // .catch(
        //     () => {
        //         this.data = new MatTableDataSource(null);
        //     }
        // );
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action === 'add') {
            dialogRef = this.dialog.open(ModalAddComponent, {
                data: { data: [], entity: this.referedClassToken, service: this.referedClassService, mapper: this.mapperService }
            });
        }
        const create = dialogRef.componentInstance.onCreate.subscribe((data) => {
            if (this.referedClassToken.__classname__ == 'Project') {
                let exists: boolean = false;

                this.data.data.forEach(element => {
                    if (element.name.toLowerCase() == data.name.toLowerCase()) {
                        this.snackBar.open(this.settings.settings_project_exists, '', { duration: 5000, horizontalPosition: 'center' });
                        exists = true;
                        return;
                    }
                });

                if (exists == false)
                    this.createElement(data);
            }
            else
                this.createElement(data);
        });

        dialogRef.afterClosed().subscribe(result => {
            create.unsubscribe();
            // console.log(console.log('The dialog was closed');
        });
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
                    if (createElement['rights'] == "ROLE_PROJECT_MANAGER" || createElement['rights'] == "ROLE_PROJECT_OFFICER" || createElement['rights'] == "ROLE_FIELD_OFFICER")
                        delete createElement['country'];
                    else if (createElement['rights'] == "ROLE_REGIONAL_MANAGER" || createElement['rights'] == "ROLE_COUNTRY_MANAGER" || createElement['rights'] == "ROLE_READ_ONLY")
                        delete createElement['projects'];
                    else {
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
