import { Component, OnInit } from '@angular/core';
import { BarChartComponent } from '../../bar-chart/bar-chart.component';

@Component({
    selector: 'app-bar-chart-vertical',
    templateUrl: './bar-chart-vertical.component.html',
    styleUrls: ['./bar-chart-vertical.component.scss']
})
export class BarChartVerticalComponent extends BarChartComponent implements OnInit {

    ngOnInit() {
        this.view = [];
        this.scheme.domain = ['#C7B42C', '#AAAAAA'];
        super.ngOnInit();
    }
}
