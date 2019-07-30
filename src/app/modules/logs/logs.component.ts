import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { LogsService } from 'src/app/core/api/logs.service';
import { finalize } from 'rxjs/operators';
import { Log } from 'src/app/models/log';
import { MatTableDataSource } from '@angular/material';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { Subscription } from 'rxjs';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { TableComponent } from 'src/app/components/table/table.component';
import { TableMobileComponent } from 'src/app/components/table/table-mobile/table-mobile.component';
import { LanguageService } from 'src/app/core/language/language.service';
import { Graph } from '../reports/models/graph.model';
import { rgb } from 'color-convert';
import { RGBLuminanceSource } from '@zxing/library';
import { DatePipe } from '@angular/common';
import { GraphValue } from '../reports/graph-value.model';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {

      // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

  public logClass = Log;
  public logs: Log[];
  public logData: MatTableDataSource<Log>;
  public loadingLog = true;
  public selectedTab = 'distributions';
  graphs: Array<Graph> = [];
  public requestsKHM;
  public requestsSYR;

  @ViewChild(TableComponent) table: TableComponent;
  @ViewChild(TableMobileComponent) tableMobile: TableMobileComponent;

  public displayedTable = this.table;

  // Screen size
  public currentDisplayType: DisplayType;
  private screenSizeSubscription: Subscription;

  constructor(
    public languageService: LanguageService,
    public logService: LogsService,
    private screenSizeService: ScreenSizeService
  ) { }

  ngOnInit() {
    this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
      this.currentDisplayType = displayType;
      if (this.currentDisplayType.type === 'mobile') {
          this.displayedTable = this.tableMobile;
      }
      else {
          this.displayedTable = this.table;
      }
    });
    this.getLogs();
  }

  ngOnDestroy() {
    this.screenSizeSubscription.unsubscribe();
}

  getLogs() {
    this.logService.get().pipe(
        finalize(
            () => {
                this.loadingLog = false;
            },
        )
    ).subscribe(
        response => {
            if (response && response.length > 0) {
                this.logs = response.map((log: any) => Log.apiToModel(log));
                this.selectTab('distributions');
                this.createGraph();
            } else if (response === null) {
                this.logs = null;
            }
        }
    );
}

selectTab(tab: string): void {
  const filteredLogList = this.logs.filter((log: Log) => log.get<string>('tabName') === tab);
  this.logData = new MatTableDataSource(filteredLogList);
  this.selectedTab = tab;
}

createGraph() {
  const sortedLogs = this.logs
    .sort((log1: Log, log2: Log) => log1.get<Date>('date').getTime() - log2.get<Date>('date').getTime());
    const oldestDate = sortedLogs[0].get<Date>('date').getFullYear();
    const latestDate = sortedLogs[sortedLogs.length - 1].get<Date>('date').getFullYear();

    const statusGraph = {
      type: 'pie',
      name: 'Success/Error Rate',  // this.language.something
      values: {}
    };

    for (let date = oldestDate; date <= latestDate; date++) {
      statusGraph.values[date] = [{date: date, name: 'success', unit: 'success', value: 0},
        {date: date, name: 'errors', unit: 'errors', value: 0}];
    }
    this.logs.forEach((log: Log) => {
      if (log.get<string>('status') === 'success') {
        statusGraph.values[log.get<Date>('date').getFullYear()][0].value++;
      } else {
        statusGraph.values[log.get<Date>('date').getFullYear()][1].value++;
      }
    });
    this.graphs.push(statusGraph);

    const dayRequestGraph = {
      type: 'line',
      name: 'Requests per day',
      yLabel: 'Requests',
      values: {}
    };

    const oldestDay = new Date();
    oldestDay.setDate(oldestDay.getDate() - 90);
    const latestDay = new Date();
    latestDay.setDate(latestDay.getDate() + 1);
    const datePipe = new DatePipe('en-US');

    for (const date = new Date(oldestDay.getTime()); date <= latestDay; date.setDate(date.getDate() + 1)) {
      dayRequestGraph.values[datePipe.transform(date, 'dd-MM-yyyy')] =
        [{date: datePipe.transform(date, 'dd-MM-yyyy'), name: 'requests', unit: 'requests', value: 0}];
    }

    this.logs.forEach((log: Log) => {
      if (dayRequestGraph.values[datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy')]) {
      dayRequestGraph.values[datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy')][0].value++;
      }
    });
    this.graphs.push(dayRequestGraph);

    const activeUsersGraph = {
      type: 'bar',
      name: 'Most active users',
      xLabel: 'Users',
      yLabel: 'Requests',
      values: {},
    };

    this.logs.forEach((log: Log) => {
      if (activeUsersGraph.values[log.get<string>('user')]) {
        activeUsersGraph.values[log.get<string>('user')][0].value++;
      } else {
        activeUsersGraph.values[log.get<string>('user')] = [{name: log.get<string>('user'), value: 1, unit: 'requests'}];
      }
    });
    activeUsersGraph.values = Object.keys(activeUsersGraph.values)
      .sort((user1, user2) => activeUsersGraph.values[user2][0].value - activeUsersGraph.values[user1][0].value)
        .reduce((_sortedObj, key) => ({..._sortedObj, [key]: activeUsersGraph.values[key]}), {});

    this.graphs.push(activeUsersGraph);

    this.requestsKHM = {
      type: 'line',
      name: 'Requests KHM',
      xLabel: 'Time',
      yLabel: 'Requests',
      values: {},
    };

    this.requestsSYR = {
      type: 'line',
      name: 'Requests SYR',
      xLabel: 'Time',
      yLabel: 'Requests',
      values: {},
    };

    for (const date = new Date(oldestDay.getTime()); date <= latestDay; date.setDate(date.getDate() + 1)) {
      this.requestsKHM.values[datePipe.transform(date, 'dd-MM-yyyy')] =
        [{date: datePipe.transform(date, 'dd-MM-yyyy'), name: 'requests', unit: 'requests', value: 0}];
      this.requestsSYR.values[datePipe.transform(date, 'dd-MM-yyyy')] =
        [{date: datePipe.transform(date, 'dd-MM-yyyy'), name: 'requests', unit: 'requests', value: 0}];
    }

    this.logs.forEach((log: Log) => {
      if (this.requestsKHM.values[datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy')]) {
        if (log.get<string>('country') === 'KHM') {
          this.requestsKHM.values[datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy')][0].value++;
        }
      }
      if (this.requestsSYR.values[datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy')]) {
        if (log.get<string>('country') === 'SYR') {
          this.requestsSYR.values[datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy')][0].value++;
        }
      }
    });
}



}
