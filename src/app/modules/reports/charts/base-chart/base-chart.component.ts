import { Component, Input } from '@angular/core';
import { Graph } from '../../dto/graph.model';
import { ColorsService } from '../../services/colors.service';

@Component({
    selector: 'app-base-chart',
    templateUrl: './base-chart.component.html',
    styleUrls: [ './base-chart.component.scss' ]
})
export class BaseChartComponent {

    constructor(
        protected colorsService: ColorsService,
    ) {}

    @Input() graphInfo: Graph;
}
