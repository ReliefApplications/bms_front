import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartTitleClass } from '../chart/chart.interface';

@Component({
  selector: 'chart-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() title: ChartTitleClass;

  @Input() loader: boolean = false;
  @Input() noData: boolean;

  constructor() { }

  ngOnInit() {
  }

}
