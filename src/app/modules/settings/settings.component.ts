import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TableMobileComponent } from 'src/app/components/table/table-mobile/table-mobile.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { LocationService } from 'src/app/core/api/location.service';
import { ProductService } from 'src/app/core/api/product-service';
import { VendorsService } from 'src/app/core/api/vendors.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { FinancialProvider } from 'src/app/model/financial-provider';
import { Product } from 'src/app/model/product';
import { Vendor } from 'src/app/model/vendor';
import { CountrySpecificService } from '../../core/api/country-specific.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { SettingsService } from '../../core/api/settings.service';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { CountrySpecific } from '../../model/country-specific';
import { Donor } from '../../model/donor';
import { Project } from '../../model/project';
import { User } from '../../model/user';
import { LanguageService } from './../../../texts/language.service';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    public nameComponent = 'settings';
    loadingExport = false;

    selectedTitle = '';
    loadingData = true;

    public referedClassService;
    referedClassToken;
    referedClassInstance: any;
    data: MatTableDataSource<CustomModel>;
    public user_action = '';
    public extensionType;

    // logs
    userLogForm = new FormControl();
    private selectedUserId: number = null;

    public maxHeight = 600;
    public maxWidth = 750;
    // public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    // public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    // public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;
    public deletable = false;
    public printable = false;
    public loggable = false;
    public editable  = false;
    public httpSubscriber: Subscription;

    @ViewChild(TableComponent) table: TableComponent;
    @ViewChild(TableMobileComponent) tableMobile: TableMobileComponent;

    public mobileMode = false;
    public displayedTable = this.table;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public dialog: MatDialog,
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
        private modalService: ModalService,
        public languageService: LanguageService,
    ) { }

    ngOnInit() {
        this.selectTitle('users');
        this.extensionType = 'xls';
    }



    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if ( window.innerWidth <= this.maxWidth) {
            this.mobileMode = true;
            this.displayedTable = this.tableMobile;
        }
        else {
            this.mobileMode = false;
            this.displayedTable = this.table;
        }
    }



  selectTitle(title): void {
    if (this.httpSubscriber) {
      this.httpSubscriber.unsubscribe();
    }
    this.getData(title);
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
      case 'product':
        category = 'products';
        break;
      case 'vendors':
        category = 'vendors';
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
        this.loggable = true;
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
        this.loggable = false;
        break;
      case 'projects':
        this.referedClassToken = Project;
        this.referedClassService = this.projectService;
        this.editable   = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
        this.deletable  = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
        this.printable = false;
        this.loggable = false;
        break;
      case 'country specific options':
        this.referedClassToken = CountrySpecific;
        this.referedClassService = this.countrySpecificService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = false;
        this.loggable = false;
        break;
      case 'financialProvider':
        this.referedClassToken = FinancialProvider;
        this.referedClassService = this.financialProviderService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable = false;
        this.printable = false;
        this.loggable = false;
        break;
      case 'product':
        this.referedClassToken = Product;
        this.referedClassService = this.productService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = false;
        this.loggable = false;
        break;
      case 'vendors':
        this.referedClassToken = Vendor;
        this.referedClassService = this.vendorsService;
        this.editable   = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.deletable  = this.userService.hasRights('ROLE_ADMIN_SETTINGS');
        this.printable = true;
        this.loggable = false;
        break;
      default: break;
    }
    this.load();
  }

  // TO DO : get from cache
    load(): void {
        this.data = new MatTableDataSource();

        this.httpSubscriber = this.referedClassService.get().
            pipe(
                finalize(
                    () => {
                        this.loadingData = false;
                    }
                )
            ).subscribe( (response: any) => {
                const instances = [];
                if (response && response.length !== 0) {
                    for (const item of response ) {
                        instances.push(this.referedClassToken.apiToModel(item));
                    }
                    this.data = new MatTableDataSource(instances);
                    if (this.table) {
                    this.table.setDataTableProperties();
                    }
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
            case (Vendor):
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
    openDialog(dialogDetails: any): void {
        this.modalService.openDialog(this.referedClassToken, this.referedClassService, dialogDetails);
        this.modalService.isCompleted.subscribe(() => {
            this.load();
        });
    }

    print(event: CustomModel) {
      this.snackbar.info(this.language.voucher_print_starting);
      return this.referedClassService.print(event);
  }
}
