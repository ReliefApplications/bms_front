import { Component, Input } from '@angular/core';
import { Graph } from '../../../graph.model';

@Component({
    selector: 'app-base-chart',
    templateUrl: './base-chart.component.html',
    styleUrls: [ './base-chart.component.scss' ]
})
export class BaseChartComponent {
    @Input() graphInfo: Graph;
}
