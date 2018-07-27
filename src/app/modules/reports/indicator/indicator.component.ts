import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Indicator } from '../../../model/indicator';
import { FilterInterface } from '../../../model/filter';

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

  public computedMethod: string;
  public newFilters;

  constructor() {
    this.computedMethod = "Nombre absolu";
  }

  ngOnInit() {
    this.chartDimensions = [400, 300];
  }

}
