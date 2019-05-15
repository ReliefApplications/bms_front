import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Indicator } from '../../../models/indicator';
import { FilterInterface } from '../../../models/filter';

@Component({
    selector: 'app-indicator',
    templateUrl: './indicator.component.html',
    styleUrls: ['./indicator.component.scss']
})
export class IndicatorComponent implements OnInit {

    @ViewChild('chart') chartDiv;
    @Input() indicator: Indicator;
    @Input() chartDimensions: number[];
    @Input() filters: Array<FilterInterface> = [];
    @Input() xAxisLabel;
    @Input() project: string[];
    @Input() distribution: string[];
    @Input() periodFrequency: string;

    public newFilters;

    constructor() { }

    ngOnInit() {
        this.chartDimensions = [400, 300];
    }
}
