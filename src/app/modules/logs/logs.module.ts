import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { BarChartComponent } from '../reports/charts/bar-chart/bar-chart.component';
import { BaseChartComponent } from '../reports/charts/base-chart/base-chart.component';
import { LineChartComponent } from '../reports/charts/line-chart/line-chart.component';
import { PieChartComponent } from '../reports/charts/pie-chart/pie-chart.component';
import { LogsComponent } from './logs.component';
import { ReportsModule } from '../reports/reports.module';



@NgModule({

    imports: [
        // Angular Modules
        SharedModule,
        CommonModule,
        ReactiveFormsModule,
        NgSelectModule,
        ReportsModule
    ],
    declarations: [
        LogsComponent,
    ]
})
export class LogsModule { }
