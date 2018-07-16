import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartTitleClass, ChartModalConfigClass } from '../chart/chart.interface';

@Component({
  selector: 'chart-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() title: ChartTitleClass;
  @Input() modalConfig: ChartModalConfigClass;

  @Input() loader: boolean = false;
  @Input() noData: boolean;
  @Input() menuOpen: boolean = false;

  @Output() menuAction = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
    
  }

  setAction(action: string) {
    this.menuAction.emit(action);
  }

  toggleChartMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
