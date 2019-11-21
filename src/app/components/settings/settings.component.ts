import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TableMobileComponent } from 'src/app/components/table/table-mobile/table-mobile.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { LocationService } from 'src/app/core/api/location.service';
import { OrganizationService } from 'src/app/core/api/organization.service';
import { ProductService } from 'src/app/core/api/product.service';
import { VendorsService } from 'src/app/core/api/vendors.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { FinancialProvider } from 'src/app/models/financial-provider';
import { Organization } from 'src/app/models/organization';
import { Product } from 'src/app/models/product';
import { Vendor } from 'src/app/models/vendor';
import { CountrySpecificService } from '../../core/api/country-specific.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { SettingsService } from '../../core/api/settings.service';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { CountrySpecific } from '../../models/country-specific';
import { Donor } from '../../models/donor';
import { Project } from '../../models/project';
import { User } from '../../models/user';
import { OrganizationServices } from 'src/app/models/organization-services';
import { OrganizationServicesService } from 'src/app/core/api/organization-services.service';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

    @Input() selectedTitle: string;

    loadingExport = false;
    loadingData = true;
    modalSubscriptions: Array<Subscription> = [];

    public referedClassService;
    referedClassToken;
    referedClassInstance: any;
    data: MatTableDataSource<CustomModel>;
    public user_action = '';
    public extensionType;

    // logs
    userLogForm = new FormControl();
    private selectedUserId: number = null;

    public deletable = false;
    public printable = false;
    public loggable = false;
    public editable = false;
    public exportable = true;
    public httpSubscriber: Subscription;

    @ViewChild(TableComponent, { static: false }) table: TableComponent;
    @ViewChild(TableMobileComponent, { static: false }) tableMobile: TableMobileComponent;

    public displayedTable = this.table;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public dialog: MatDialog,
        public authenticationService: AuthenticationService,
        public distributionService: DistributionService,
        public donorService: DonorService,
        public projectService: ProjectService,
        public userService: UserService,
        public countrySpecificService: CountrySpecificService,
        public financialProviderService: FinancialProviderService,
        private locationService: LocationService,
        private _settingsService: SettingsService,
        private snackbar: SnackbarService,
        public productService: ProductService,
        private vendorsService: VendorsService,
        private modalService: ModalService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
        private organizationService: OrganizationService,
        private organizationServicesService: OrganizationServicesService,
    ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
            if (this.currentDisplayType.type === 'mobile') {
                this.displayedTable = this.tableMobile;
            }
            else {
                this.displayedTable = this.table;
            }
        });
        this.extensionType = 'xls';
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
        this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
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
                    if (!exported && result) {
                        exported = true;

                        country = result[0].country_i_s_o3;
                        return this._settingsService.export(this.extensionType, category, country).subscribe(
                            () => { this.loadingExport = false; },
                            (_error: any) => { this.loadingExport = false; }
                        );
                    }
                }
            );
        } else {
            return this._settingsService.export(this.extensionType, category, country).subscribe(
                () => { this.loadingExport = false; },
                (_error: any) => { this.loadingExport = false; }
            );
        }
    }

    getData(title) {
        if (this.httpSubscriber) {
            this.httpSubscriber.unsubscribe();
        }
        this.loadingData = true;
        switch (title) {
            case 'users':
                this.referedClassToken = User;
                this.referedClassService = this.userService;
                this.loggable = true;
                this.editable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.deletable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.printable = false;
                this.exportable = true;
                break;
            case 'donors':
                this.referedClassToken = Donor;
                this.referedClassService = this.donorService;
                this.editable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.deletable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.printable = false;
                this.loggable = false;
                this.exportable = true;
                break;
            case 'projects':
                this.referedClassToken = Project;
                this.referedClassService = this.projectService;
                this.editable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.deletable = this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
                this.printable = false;
                this.loggable = false;
                this.exportable = true;
                break;
            case 'country specific options':
                this.referedClassToken = CountrySpecific;
                this.referedClassService = this.countrySpecificService;
                this.editable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.deletable = this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
                this.printable = false;
                this.loggable = false;
                this.exportable = true;
                break;
            case 'financialProvider':
                this.referedClassToken = FinancialProvider;
                this.referedClassService = this.financialProviderService;
                this.editable = this.userService.hasRights('ROLE_ADMIN');
                this.deletable = false;
                this.printable = false;
                this.loggable = false;
                this.exportable = false;
                break;
            case 'organization':
                this.referedClassToken = Organization;
                this.referedClassService = this.organizationService;
                this.editable = this.userService.hasRights('ROLE_ADMIN');
                this.deletable = false;
                this.printable = true;
                this.loggable = false;
                this.exportable = false;
                break;
            case 'organizationServices':
                this.referedClassToken = OrganizationServices;
                this.referedClassService = this.organizationServicesService;
                this.editable = this.userService.hasRights('ROLE_ADMIN');
                this.deletable = false;
                this.printable = false;
                this.loggable = false;
                this.exportable = false;
                break;
            case 'product':
                this.referedClassToken = Product;
                this.referedClassService = this.productService;
                this.editable = this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
                this.deletable = this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
                this.printable = false;
                this.loggable = false;
                this.exportable = true;
                break;
            case 'vendors':
                this.referedClassToken = Vendor;
                this.referedClassService = this.vendorsService;
                this.editable = this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
                this.deletable = this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
                this.printable = true;
                this.loggable = false;
                this.exportable = true;
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
            ).subscribe((response: any) => {
                const instances = [];
                if (response && response.length !== 0) {
                    for (const item of response) {
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
                return this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
            case (CountrySpecific):
                return this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
            case (Donor):
                return this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
            case (Project):
                return this.userService.hasRights('ROLE_PROJECT_MANAGEMENT');
            case (FinancialProvider):
                return this.userService.hasRights('ROLE_FINANCIAL_PROVIDER_MANAGEMENT');
            case (Vendor):
                return this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
            case (Product):
                return this.userService.hasRights('ROLE_DISTRIBUTIONS_DIRECTOR');
            case (Organization):
                return false; // We cannot add an organization because there is only one
            default:
                return false;
        }
    }

    /**
	* open each modal dialog
	*/
    openDialog(dialogDetails: any): void {
        this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        this.modalService.openDialog(this.referedClassToken, this.referedClassService, dialogDetails);
        const isLoadingSubscription = this.modalService.isLoading.subscribe(() => {
            this.loadingData = true;
        });
        const completeSubscription = this.modalService.isCompleted.subscribe((response: boolean) => {
            if (response) {
                this.load();
            } else {
                this.loadingData = false;
            }
        });
        this.modalSubscriptions = [isLoadingSubscription, completeSubscription];
    }

    print(event: CustomModel) {
        this.snackbar.info(this.language.settings_print_starting);
        return this.referedClassService.print(event);
    }

}
