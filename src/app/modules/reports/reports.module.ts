import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule   } from '../../shared/shared.module';


// // Routing
// import { ReportsRouting } from './reports.routing';

// Components
import { ReportsComponent } from './reports.component';
import { DataTableComponent } from './data-table/data-table.component';
import { IndicatorComponent } from './indicator/indicator.component';
import { IndicatorPageComponent } from './indicator-page/indicator-page.component';

//filter
import { ButtonFilterComponent } from './filters/button-filter/button-filter.component';
import { HeaderComponent } from './charts/header/header.component';

//charts
import { ChartComponent } from './charts/chart/chart.component';
import { AdvancedPieChartComponent } from './charts/advanced-pie-chart/advanced-pie-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { BarChartVerticalComponent } from './charts/bar-chart/bar-chart-vertical/bar-chart-vertical.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { NumberCardChartComponent } from './charts/number-card-chart/number-card-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { PieGridComponent } from './charts/pie-grid/pie-grid.component';
import { StackedVerticalBarChartComponent } from './charts/stacked-vertical-bar-chart/stacked-vertical-bar-chart.component';

//modal
import { ModalComponent } from './modals/modal.component';
import { ModalDataComponent } from './modals/modal-data/modal-data.component';
import { ReportingModalDetailsComponent } from './modals/modal-details/modal-details.component';

@NgModule({

    imports: [
      // Routing
    //   ReportsRouting,
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
        DataTableComponent,
        IndicatorComponent,
        IndicatorPageComponent,
        ButtonFilterComponent,
        ChartComponent,
        AdvancedPieChartComponent,
        BarChartComponent,
        BarChartVerticalComponent,
        LineChartComponent,
        NumberCardChartComponent,
        PieChartComponent,
        PieGridComponent,
        StackedVerticalBarChartComponent,
        HeaderComponent,
        ModalComponent,
        ModalDataComponent,
        ReportingModalDetailsComponent        
    ]
    })
    export class ReportsModule {}
    