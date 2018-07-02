import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule   } from '../../shared/shared.module';


// Routing
import { ReportsRouting } from './reports.routing';

// Components
import { ReportsComponent } from './reports.component';
import { DataTableComponent } from './data-table/data-table.component';

@NgModule({

    imports: [
      // Routing
      ReportsRouting,
      // Angular Modules
      CommonModule,
      // Feature Modules
      NgxChartsModule,
      FormsModule,
      ReactiveFormsModule,
      SharedModule
    ],
    declarations: [
        ReportsComponent,
        DataTableComponent
    ],
    providers: [
      ]
    })
    export class ReportsModule {}
    