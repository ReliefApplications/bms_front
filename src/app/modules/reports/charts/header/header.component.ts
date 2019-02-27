import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartTitleClass } from '../chart/chart.interface';

@Component({
    selector: 'app-chart-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    @Input() title: ChartTitleClass;

    @Input() loader = false;
    @Input() noData: boolean;

    constructor() { }

    ngOnInit() { }
}
