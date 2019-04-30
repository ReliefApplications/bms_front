import { Component, DoCheck, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { LocationService } from 'src/app/core/api/location.service';
import { ProductService } from 'src/app/core/api/product-service';
import { VendorsService } from 'src/app/core/api/vendors.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { FinancialProvider } from 'src/app/model/financial-provider';
import { Product } from 'src/app/model/product';
import { Vendors } from 'src/app/model/vendors';
import { GlobalText } from '../../../texts/global';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { CountrySpecificService } from '../../core/api/country-specific.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { SettingsService } from '../../core/api/settings.service';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { Mapper } from '../../core/utils/mapper.service';
import { CountrySpecific } from '../../model/country-specific';
import { Donor } from '../../model/donor';
import { Project } from '../../model/project';
import { User } from '../../model/user';





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
    isBoxClicked = false;
    loadingData = true;

    public referedClassService;
    referedClassToken;
    data: MatTableDataSource<any>;
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
    public deletable = false;
    public printable = false;
    public editable  = false;
    public httpSubscriber: Subscription;

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
        private snackbar: SnackbarService,
        public productService: ProductService,
        private vendorsService: VendorsService,
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
    if (this.httpSubscriber) {
      this.httpSubscriber.unsubscribe();
    }
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
      case 'products':
        category = 'product';
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
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable  = false;
        break;
      case 'donors':
        this.referedClassToken = Donor;
        this.referedClassService = this.donorService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = false;

        break;
      case 'projects':
        this.referedClassToken = Project;
        this.referedClassService = this.projectService;
        this.editable   = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
        this.deletable  = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
        this.printable = false;
        break;
      case 'country specific options':
        this.referedClassToken = CountrySpecific;
        this.referedClassService = this.countrySpecificService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = false;
        break;
      case 'financialProvider':
        this.referedClassToken = FinancialProvider;
        this.referedClassService = this.financialProviderService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable = false;
        this.printable = false;
        break;
      case 'product':
        this.referedClassToken = Product;
        this.referedClassService = this.productService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = false;
        break;
      case 'vendors':
        this.referedClassToken = Vendors;
        this.referedClassService = this.vendorsService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = true;
        break;
      default: break;
    }
    this.load(title);
  }

  // TO DO : get from cache
    load(title): void {
        this.httpSubscriber = this.referedClassService.get().
            pipe(
                finalize(
                    () => {
                        this.loadingData = false;
                    }
                )
            ).subscribe(response => {
                if (response) {
                    this.loadingData = false;
                    if (response && response[0] && response[0].email && response[0].username && response[0].roles) {
                        response.forEach(element => {
                            element.projects = new Array<number>();
                            element.country = '';

                            for (let i = 0; i < element.user_projects.length; i++) {
                                if (element.user_projects[i].project) {
                                    element.projects[i] = element.user_projects[i].project.name;
                                }
                            }
                            for (let i = 0; i < element.countries.length; i++) {
                                element.country = element.countries[i].iso3;
                            }
                        });
                    }

                    response = this.referedClassToken.formatArray(response);
                    this.data = new MatTableDataSource(response);
                } else {
                    this.data = new MatTableDataSource(null);
                    this.loadingData = false;
                }
            });
    }

    checkRights(): boolean {
        switch (this.referedClassToken) {
            case (User):
                return this.userService.hasRights('ROLE_USER_MANAGEMENT');
            case (CountrySpecific):
                return this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
            case (Donor):
                return this.userService.hasRights('ROLE_DONOR_MANAGEMENT');
            case (Project):
                return this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
            case (FinancialProvider):
                return this.userService.hasRights('ROLE_FINANCIAL_PROVIDER_MANAGEMENT');
            case (Vendors):
                return this.userService.hasRights('ROLE_VENDORS_MANAGEMENT');
            case (Product):
                return this.userService.hasRights('ROLE_PRODUCT_MANAGEMENT');
            default:
                return false;
        }
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
            if (this.referedClassToken.__classname__ === 'Project') {
                let exists = false;

                this.data.data.forEach(element => {
                    if (element.name.toLowerCase() === data.name.toLowerCase()) {
                        this.snackbar.error(this.settings.settings_project_exists);
                        exists = true;
                        return;
                    }
                });

                if (exists === false) {
                    this.createElement(data);
                }
            } else {
                this.createElement(data);
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            create.unsubscribe();
        });
    }

    createElement(createElement: Object) {
        createElement = this.referedClassToken.formatForApi(createElement);
        if (this.referedClassToken.__classname__ !== 'User' && this.referedClassToken.__classname__ !== 'Vendors') {
            this.referedClassService.create(createElement['id'], createElement).subscribe(
                response => {
                    this.selectTitle(this.selectedTitle);
                });
        } else {
            // for users, there are two step (one to get the salt and one to create the user)
            this.authenticationService.initializeUser(createElement['username']).subscribe(response => {
                if (response) {
                  if (this.referedClassToken.__classname__ === 'Vendors') {
                    this.authenticationService.createVendor(createElement, response).subscribe(
                      () => {
                        this.selectTitle(this.selectedTitle);
                      });
                  } else {
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
                }
            });
        }
    }
}
