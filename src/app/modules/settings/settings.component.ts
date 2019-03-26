import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TableComponent } from 'src/app/components/table/table.component';
import { FinancialProviderService } from 'src/app/core/api/financial-provider.service';
import { LocationService } from 'src/app/core/api/location.service';
import { ProductService } from 'src/app/core/api/product-service';
import { VendorsService } from 'src/app/core/api/vendors.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { FinancialProvider } from 'src/app/model/financial-provider';
import { Product } from 'src/app/model/product';
import { Vendors } from 'src/app/model/vendors';
import { GlobalText } from 'src/texts/global';
import { ModalAddComponent } from '../../components/modals/modal-add/modal-add.component';
import { ModalDeleteComponent } from '../../components/modals/modal-delete/modal-delete.component';
import { ModalDetailsComponent } from '../../components/modals/modal-details/modal-details.component';
import { ModalEditComponent } from '../../components/modals/modal-edit/modal-edit.component';
import { CountrySpecificService } from '../../core/api/country-specific.service';
import { DistributionService } from '../../core/api/distribution.service';
import { DonorService } from '../../core/api/donor.service';
import { ProjectService } from '../../core/api/project.service';
import { SettingsService } from '../../core/api/settings.service';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { Mapper } from '../../core/utils/mapper.service';
import { CountrySpecific } from '../../model/country-specific.new';
import { Donor } from '../../model/donor.new';
import { Project as NewProject } from '../../model/project.new';
import { User } from '../../model/user';





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
    public printable = false;
    public httpSubscriber: Subscription;

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
        private snackbar: SnackbarService,
        public productService: ProductService,
        private vendorsService: VendorsService,
    ) { }

    ngOnInit() {
        this.checkSize();
        this.selectTitle('users');
        this.extensionType = 'xls';
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
        this.deletable = true;
        this.printable = false;
        break;
      case 'donors':
        this.referedClassToken = Donor;
        this.referedClassService = this.donorService;
        this.deletable = true;
        this.printable = false;

        break;
      case 'projects':
        this.referedClassToken = NewProject;
        this.referedClassService = this.projectService;
        this.deletable = true;
        this.printable = false;
        break;
      case 'country specific options':
        this.referedClassToken = CountrySpecific;
        this.referedClassService = this.countrySpecificService;
        this.deletable = true;
        this.printable = false;
        break;
      case 'financialProvider':
        this.referedClassToken = FinancialProvider;
        this.referedClassService = this.financialProviderService;
        this.deletable = false;
        this.printable = false;
        break;
      case 'product':
        this.referedClassToken = Product;
        this.referedClassService = this.productService;
        this.deletable = true;
        this.printable = false;
        break;
      case 'vendors':
        this.referedClassToken = Vendors;
        this.referedClassService = this.vendorsService;
        this.deletable = true;
        this.printable = true;
        break;
      default: break;
    }
    this.load();
  }

  // TO DO : get from cache
    load(): void {
        this.data = null;
        this.hasRights = false;

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
        });
    }


    /**
	* open each modal dialog
	*/
    openDialog(dialogDetails: any): void {
        let dialogRef: MatDialogRef<any>;
        switch (dialogDetails.action) {
            case 'add':
                dialogRef = this.openAddDialog();
                break;
            case 'details':
                dialogRef = this.openDetailsDialog(dialogDetails.element);
                break;
            case 'edit':
                dialogRef = this.openEditDialog(dialogDetails.element);
                break;
            case 'delete':
                dialogRef = this.openDeleteDialog(dialogDetails.element);
                break;

            default:
                this.snackbar.error('Modal error');
                break;
        }

        const subscription = dialogRef.afterClosed().subscribe((closeMethod: string) => {
            if (closeMethod === 'Add') {
                this.referedClassService.create(this.referedClassInstance.modelToApi()).subscribe(() => {
                    this.snackbar.error(this.settings.settings_project_exists);
                    this.load();
                });

            } else if (closeMethod === 'Edit') {
                this.updateElement(dialogDetails.element);
            } else if (closeMethod === 'Delete') {
                this.deleteElement(dialogDetails.element);
            }
            // Reload table
            this.table.checkData();
            // Prevent memory leaks
            subscription.unsubscribe();
        });
    }

    openAddDialog() {
        this.referedClassInstance = new this.referedClassToken();
        this.referedClassService.fillWithOptions(this.referedClassInstance);

        return this.dialog.open(ModalAddComponent, {
            data: {
                objectInstance: this.referedClassInstance,
            }
        });
    }

    openDetailsDialog(objectInfo: CustomModel) {
        this.referedClassService.fillWithOptions(objectInfo);
        return this.dialog.open(ModalDetailsComponent, {
            data: {
                objectInstance: objectInfo,
            }
        });
    }

    openEditDialog(objectInfo: CustomModel) {
        this.referedClassService.fillWithOptions(objectInfo);
            return this.dialog.open(ModalEditComponent, {
                data: {
                    objectInstance: objectInfo
                 }
            });
    }

    openDeleteDialog(objectInfo: CustomModel) {
        return this.dialog.open(ModalDeleteComponent, {
            data: {
                data: objectInfo,
            }
        });
    }


    updateElement(updateElement) {
        const apiUpdateElement = updateElement.modelToApi(updateElement);
        this.referedClassService.update(apiUpdateElement['id'], apiUpdateElement).subscribe((response: any) => {
            this.load();
        });
    }

    deleteElement(deleteElement: CustomModel) {
            this.referedClassService.delete(deleteElement.fields['id'].value).subscribe(response => {
                this.load();
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
