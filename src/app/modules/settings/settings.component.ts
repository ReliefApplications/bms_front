import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSnackBar } from '@angular/material';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { DistributionService } from '../../core/api/distribution.service';
import { CacheService } from '../../core/storage/cache.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { CountrySpecificService } from '../../core/api/country-specific.service';

import { Mapper } from '../../core/utils/mapper.service';

import { DistributionData } from '../../model/distribution-data';
import { Donor } from '../../model/donor';
import { Project } from '../../model/project';
import { UserInterface } from '../../model/interfaces';
import { CountrySpecific } from '../../model/country-specific';

import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';

import { GlobalText } from '../../../texts/global';
import { SettingsService } from '../../core/api/settings.service';
import { ExportInterface } from '../../model/export.interface';
import { saveAs } from 'file-saver/FileSaver';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    public nameComponent = 'settings_title';
    public settings = GlobalText.TEXTS;

    selectedTitle = '';
    isBoxClicked = false;
    loadingData = true;
    
    public referedClassService;
    referedClassToken;
    data: MatTableDataSource<any>;
    public user_action = '';
    public extensionType;

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    constructor(
        public dialog: MatDialog,
        public mapperService: Mapper,
        public authenticationService: AuthenticationService,
        public distributionService: DistributionService,
        public donorService: DonorService,
        public projectService: ProjectService,
        public userService: UserService,
        public countrySpecificService: CountrySpecificService,
        private _cacheService: CacheService,
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
        if (this.settings !== GlobalText.TEXTS) {
            this.settings = GlobalText.TEXTS;
            this.nameComponent = GlobalText.TEXTS.settings_title;
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
                country = this._cacheService.get(CacheService.ADM1)[0].country_i_s_o3;
                break;
            default:
                break;
        }
        return this._settingsService.export(this.extensionType, category, country);
    }

    getData(title) {
        switch (title) {
            case 'users':
                this.referedClassToken = UserInterface;
                this.referedClassService = this.userService;
                break;
            case 'donors':
                this.referedClassToken = Donor;
                this.referedClassService = this.donorService;
                break;
            case 'projects':
                this.referedClassToken = Project;
                this.referedClassService = this.projectService;
                break;
            case 'country specific options':
                this.referedClassToken = CountrySpecific;
                this.referedClassService = this.countrySpecificService;
                break;
            default: break;
        }
        this.load(title);
    }

    // TO DO : get from cache
    load(title): void {
        this.referedClassService.get().subscribe(response => {
            response = this.referedClassToken.formatArray(response);
            this._cacheService.set((<typeof CacheService>this._cacheService.constructor)[this.referedClassToken.__classname__.toUpperCase() + 'S'], response);
            this.data = new MatTableDataSource(response);
            this.loadingData = false;
        });
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
            this.createElement(data);
        });

        dialogRef.afterClosed().subscribe(result => {
            create.unsubscribe();
            // console.log(console.log('The dialog was closed');
        });
    }

    createElement(createElement: Object) {
        createElement = this.referedClassToken.formatForApi(createElement);
        if (this.referedClassToken.__classname__ !== 'UserInterface') {
            this.referedClassService.create(createElement['id'], createElement).subscribe(response => {
                this.selectTitle(this.selectedTitle);
            });
        } else {
            // for users, there are two step (one to get the salt and one to create the user)
            this.authenticationService.requestSalt(createElement['username']).subscribe(response => {
                if (response) {
                    this.authenticationService.createUser(createElement['id'], createElement, response).subscribe(response => {
                        this.selectTitle(this.selectedTitle);
                    });
                }
            });
        }
    }
}
