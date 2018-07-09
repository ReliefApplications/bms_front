import { NgModule                                               } from '@angular/core';
import { RouterModule, Routes                                   } from '@angular/router';
import { CommonModule                                           } from '@angular/common';
import { FormsModule, ReactiveFormsModule                       } from '@angular/forms';
import { FormControl, FormGroup, Validators                     } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatSelectModule, MatOptionModule, MatPaginatorModule, MatExpansionModule, MatDatepickerModule, MatNativeDateModule, MatCardModule} from '@angular/material';
import { MatProgressSpinnerModule                               } from '@angular/material/progress-spinner';
import { MatIconModule                                          } from '@angular/material/icon';
import { MatTooltipModule                                       } from '@angular/material/tooltip'
import { MatTableModule                                         } from '@angular/material/table';
import { MatSortModule                                          } from '@angular/material/sort';
import { MatDialogModule                                        } from '@angular/material/dialog';
import { MatFormFieldModule                                     } from '@angular/material/form-field';
import { MatInputModule                                         } from '@angular/material';
import { BrowserAnimationsModule                                } from '@angular/platform-browser/animations'

import { MenuItemBoxComponent                                   } from '../components/menu-item-box/menu-item-box.component';
import { IconSvgComponent                                       } from '../components/icon-svg/icon-svg.component';
import { BoxDashboardComponent                                  } from '../components/box/box-dashboard/box-dashboard.component';
import { BoxSettingComponent                                    } from '../components/box/box-setting/box-setting.component';
import { BoxComponent                                           } from '../components/box/box.component';
import { TableComponent                                         } from '../components/table/table.component';
import { TableSearchComponent                                   } from '../components/table/table-search/table-search.component';
import { TableMobileComponent                                   } from '../components/table/table-mobile/table-mobile.component';
import { TableMobileSearchComponent                             } from '../components/table/table-mobile-search/table-mobile-search.component';
import { ModalComponent                                         } from '../components/modals/modal.component';
import { ModalDeleteComponent                                   } from '../components/modals/modal-delete/modal-delete.component';
import { ModalUpdateComponent                                   } from '../components/modals/modal-update/modal-update.component';
import { ModalDetailsComponent                                  } from '../components/modals/modal-details/modal-details.component';

import { LoginComponent                                         } from '../modules/public/login.component';
import { DashboardComponent                                     } from '../modules/dashboard/dashboard.component';
import { MenuComponent                                          } from '../modules/menus/menu/menu.component';
import { MenuTopComponent                                       } from '../modules/menus/menu-top/menu-top.component';
import { HeaderMenuTopComponent                                 } from '../modules/menus/header-menu-top/header-menu-top.component';
import { HouseholdsComponent                                    } from '../modules/households/households.component';
import { DistributionComponent                                  } from '../modules/distribution/distribution.component';
import { SettingsComponent                                      } from '../modules/settings/settings.component';
import { HeaderComponent                                        } from '../modules/header/header.component';
import { HouseholdsImportComponent                              } from '../modules/households/households-import/households-import.component';
import { DataValidationComponent                                } from '../modules/households/data-validation/data-validation.component';

@NgModule({
    imports: [
        RouterModule,
        CommonModule, // to use instead of BrowserModule if you are using lazyloaded module  like Malnutrition
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule, 
        MatTooltipModule,
        MatSelectModule,
        MatTableModule,
        MatOptionModule,
        MatButtonModule,
        MatSortModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatSelectModule,
        BrowserAnimationsModule
    ],
    declarations: [
        //Shared Components
        LoginComponent,
        DashboardComponent, 
        MenuComponent,
        MenuItemBoxComponent,
        HouseholdsComponent,
        HouseholdsImportComponent,
		DistributionComponent,
		SettingsComponent,
		HeaderComponent,     
        IconSvgComponent,
		BoxDashboardComponent,        
		TableComponent,
		TableSearchComponent,
		TableMobileComponent,
		TableMobileSearchComponent,
		MenuTopComponent,
		HeaderMenuTopComponent,
        ModalComponent,
        ModalDeleteComponent,
		ModalUpdateComponent,
		ModalDetailsComponent,
		BoxSettingComponent,
        BoxComponent,
        DataValidationComponent
    ],
    entryComponents: [
        ModalComponent,
        ModalDeleteComponent,
		ModalUpdateComponent,
		ModalDetailsComponent,
    ],
    exports: [
        //Shared Components
        LoginComponent, 
		DashboardComponent,                 
        MenuComponent,
        MenuItemBoxComponent,
        HouseholdsComponent,
        HouseholdsImportComponent,
		DistributionComponent,
		SettingsComponent,
		HeaderComponent,                
		IconSvgComponent,
		BoxDashboardComponent,        
		TableComponent,
		TableSearchComponent,
		TableMobileComponent,
		TableMobileSearchComponent,
		MenuTopComponent,
		HeaderMenuTopComponent,
        ModalComponent,
        ModalDeleteComponent,
		ModalUpdateComponent,
		ModalDetailsComponent,
		BoxSettingComponent,
        BoxComponent,
        MatCheckboxModule, 
        MatTooltipModule,
        MatSelectModule,
        MatTableModule,
        MatOptionModule,
        MatButtonModule,
        MatSortModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatCardModule,
        MatNativeDateModule,
        MatSelectModule,
        DataValidationComponent

    ],
    providers: []
})
export class SharedModule { }