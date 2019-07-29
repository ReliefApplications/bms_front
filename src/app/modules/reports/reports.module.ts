import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from 'src/app/shared/shared.module';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { BaseChartComponent } from './charts/base-chart/base-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { ReportsComponent } from './reports.component';



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
        BarChartComponent,
    ],
    exports: [
        ReportsComponent,
        LineChartComponent,
        BaseChartComponent,
        PieChartComponent,
        BarChartComponent,
    ]
})
export class ReportsModule { }
