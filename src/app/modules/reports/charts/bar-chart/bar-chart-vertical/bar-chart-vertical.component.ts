import { Component, OnInit } from '@angular/core';

import { BarChartComponent } from '../../bar-chart/bar-chart.component';


@Component({
  selector: 'bar-chart-vertical',
  templateUrl: './bar-chart-vertical.component.html',
  styleUrls: ['./bar-chart-vertical.component.scss']
})
export class BarChartVerticalComponent extends BarChartComponent implements OnInit {


    //   this.data = [
    //       {
    //           "name": "Germany",
    //           "value": 8940000
    //       },
    //       {
    //           "name": "Spain",
    //           "value": 500000
    //       },
    //       {
    //           "name": "UK",
    //           "value": 6800000
    //       }
    //   ];
  

  ngOnInit() {
    this.view = [];
    this.scheme.domain = ['#C7B42C', '#AAAAAA'];
    super.ngOnInit();
  }

}
