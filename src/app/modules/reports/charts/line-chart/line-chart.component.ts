import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartPoint } from 'chart.js';
import { Color as ChartColor, Label } from 'ng2-charts';
import { BaseChartComponent } from '../base-chart/base-chart.component';
import { Graph } from '../../models/graph.model';

@Component({
    selector: 'app-line-chart',
    templateUrl: './line-chart.component.html',
    styleUrls: [ './line-chart.component.scss' ]
})

export class LineChartComponent extends BaseChartComponent implements OnInit {

    dataSets: ChartDataSets[];
    xAxisLabels: Label[];

    @Input() multipleGraphInfo: Graph[];

    public options: ChartOptions;

    public lineChartColors: ChartColor[];

    ngOnInit() {
        this.xAxisLabels = [];
        if (this.multipleGraphInfo) {
            this.dataSets = this.multipleGraphInfo.map((graph: Graph) => {
                return {
                    label: graph.name,
                    data: []
                };
            });
            this.multipleGraphInfo.forEach((graph: Graph, index: number) => {
                this.generateDataSet(graph, this.dataSets[index]);
            });
        } else {
            this.dataSets = [{
                label: this.graphInfo.name,
                data: []
            }];
            this.generateDataSet(this.graphInfo, this.dataSets[0]);
        }
        this.generateColors();
        this.generateLabels();
    }

    private generateDataSet(graph: Graph, dataset: ChartDataSets): void {
        // Object.values does not type correctly. Using Object.keys is the safe option here
        Object.keys(graph.values).forEach((period: string) => {
            // Casting is necessary due to a type error otherwise
            (dataset.data as (number | ChartPoint)[]).push(graph.values[period][0].value);
            if (!this.xAxisLabels.includes(graph.values[period][0].date)) {
                this.xAxisLabels.push(graph.values[period][0].date);
            }
        });
    }


    private generateColors() {
        const mainColor = this.colorsService.chooseRandomColor();
        this.lineChartColors = [
            {
                borderColor: mainColor.string(),
                backgroundColor: mainColor.lighten(0.1).alpha(0.5).string(),
                pointHoverBackgroundColor: mainColor.darken(0.5).string(),
                hoverBackgroundColor: mainColor.darken(0.3).string(),
                pointBorderColor: mainColor.darken(0.1).string(),
            }
        ];
    }
}
