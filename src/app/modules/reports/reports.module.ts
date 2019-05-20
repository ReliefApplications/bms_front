import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from 'src/app/shared/shared.module';
import { LineChartComponent } from './charts/chartjs/line-chart/line-chart.component';
import { ReportsComponent } from './reports.component';
import { BaseChartComponent } from './charts/chartjs/base-chart/base-chart.component';
import { PieChartComponent } from './charts/chartjs/pie-chart/pie-chart.component';



@NgModule({

    imports: [
        // Angular Modules
        SharedModule,
        ChartsModule,
        CommonModule,
        ReactiveFormsModule,
        NgSelectModule,
        ChartsModule,

    ],
    declarations: [
        ReportsComponent,
        LineChartComponent,
        BaseChartComponent,
        PieChartComponent,
    ]
})
export class ReportsModule { }
