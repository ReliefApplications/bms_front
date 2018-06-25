import { NgModule                                               } from '@angular/core';
import { RouterModule, Routes                                   } from '@angular/router';
import { CommonModule                                           } from '@angular/common';
import { FormsModule, ReactiveFormsModule                       } from '@angular/forms';
import { FormControl, FormGroup, Validators                     } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatSelectModule, MatOptionModule                } from '@angular/material';
import { MatProgressSpinnerModule                               } from '@angular/material/progress-spinner';
import { MatIconModule                                          } from '@angular/material/icon';
import { MatTooltipModule                                       } from '@angular/material/tooltip'
import { MatTableModule                                         } from '@angular/material/table';
import { MatSortModule                                          } from '@angular/material/sort';
import { BrowserAnimationsModule                                } from '@angular/platform-browser/animations'

import { MenuItemBoxComponent                                   } from '../components/menu-item-box/menu-item-box.component';
import { IconSvgComponent                                       } from '../components/icon-svg/icon-svg.component';
import { BoxDashboardComponent                                  } from '../components/box-dashboard/box-dashboard.component';
import { TableComponent                                         } from '../components/table/table.component';

import { LoginComponent                                         } from '../modules/public/login.component';
import { DashboardComponent                                     } from '../modules/dashboard/dashboard.component';
import { MenuComponent                                          } from '../modules/menus/menu/menu.component';
import { HouseholdsComponent                                    } from '../modules/households/households.component';
import { DistributionComponent                                  } from '../modules/distribution/distribution.component';
import { SettingsComponent                                      } from '../modules/settings/settings.component';
import { ReportsComponent                                       } from '../modules/reports/reports.component';
import { HeaderComponent                                        } from '../modules/header/header.component';
import { MenuTopComponent                                       } from '../modules/menus/menu-top/menu-top.component';
import { HeaderMenuTopComponent                                 } from '../modules/menus/header-menu-top/header-menu-top.component';

@NgModule({
    imports: [
        RouterModule,
        CommonModule, // to use instead of BrowserModule if you are using lazyloaded module  like Malnutrition
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule, 
        MatTooltipModule,
        MatSelectModule,
        MatTableModule,
        MatOptionModule,
        MatButtonModule,
        MatSortModule,
        MatProgressSpinnerModule,
        MatIconModule,
        BrowserAnimationsModule
    ],
    declarations: [
        //Shared Components
        LoginComponent,
        DashboardComponent, 
        MenuComponent,
        MenuItemBoxComponent,
		HouseholdsComponent,
		DistributionComponent,
		SettingsComponent,
        ReportsComponent,   
		HeaderComponent,     
        IconSvgComponent,
		BoxDashboardComponent,        
		TableComponent,
		MenuTopComponent,
		HeaderMenuTopComponent,
    ],
    exports: [
        //Shared Components
        LoginComponent, 
		DashboardComponent,                 
        MenuComponent,
        MenuItemBoxComponent,
		HouseholdsComponent,
		DistributionComponent,
		SettingsComponent,
		ReportsComponent,    
		HeaderComponent,                
		IconSvgComponent,
		BoxDashboardComponent,        
		TableComponent,
		MenuTopComponent,
		HeaderMenuTopComponent,
    ],
    providers: []
})
export class SharedModule { }