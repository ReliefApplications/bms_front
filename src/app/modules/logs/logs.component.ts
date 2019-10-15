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
import { DatePipe } from '@angular/common';
import { ModalService } from 'src/app/core/utils/modal.service';

@Component({
    selector: 'app-logs',
    templateUrl: './logs.component.html',
    styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    public logClass = Log;
    public logs: Log[];
    public logData: MatTableDataSource<Log>;
    public filteredLogList: Log[];
    public loadingLogs = true;
    public selectedTab = 'distributions';
    public requestsKHM;
    public requestsSYR;
    graphs: Array<Graph> = [];
    modalSubscriptions: Array<Subscription> = [];

    @ViewChild(TableComponent, { static: false }) table: TableComponent;
    @ViewChild(TableMobileComponent, { static: false }) tableMobile: TableMobileComponent;

    public displayedTable = this.table;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;
    public canvasAreReloading = false;

    // Amount of past days to show in the graph
    public graphDuration = 90;

    // Logs
    private logSubscription: Subscription;

    constructor(
        public languageService: LanguageService,
        public logService: LogsService,
        private modalService: ModalService,
        private screenSizeService: ScreenSizeService
    ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.canvasAreReloading = true;
            // Recreate the canvas to resize them correctly
            setTimeout(() => { this.canvasAreReloading = false; }, 0);
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
        this.logSubscription.unsubscribe();
        this.modalSubscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    getLogs() {
        this.logSubscription = this.logService.get().pipe(
            finalize(
                () => {
                    this.loadingLogs = false;
                }
            )
        ).subscribe(
            response => {
                if (response && response.length > 0) {
                    this.logs = response.reduce((realLogs, res) => {
                        const log = Log.apiToModel(res);
                        if (log) {
                            realLogs.push(log);
                        }
                        return realLogs;
                    }, []);
                    this.selectTab('distributions');
                    this.createGraphs();
                } else if (!response) {
                    this.logs = null;
                }
            }
        );
    }

    selectTab(tab: string): void {
        this.selectedTab = tab;
        if (this.logs) {
            this.filteredLogList = this.logs.filter((log: Log) => log.get<string>('tabName') === tab);
            this.filteredLogList.map((log: any) => {
                if (!log.get('details')) {
                    this.logService.getDetails(log);
                }
            });
            this.logData = new MatTableDataSource(this.filteredLogList);
            if (this.table && this.table.paginator) {
                this.table.paginator.pageIndex = 0;
            } else if (this.tableMobile && this.tableMobile.paginator) {
                this.tableMobile.paginator.pageIndex = 0;
            }
        }
    }

    createGraphs() {
        const sortedLogs = this.logs
            .sort((log1: Log, log2: Log) => log1.get<Date>('date').getTime() - log2.get<Date>('date').getTime());
        const datePipe = new DatePipe('en-US');
        // Dates in the logs
        const oldestDate = sortedLogs[0].get<Date>('date').getFullYear();
        const latestDate = sortedLogs[sortedLogs.length - 1].get<Date>('date').getFullYear();
        // Dates in the graphs
        const oldestDay = new Date();
        oldestDay.setDate(oldestDay.getDate() - this.graphDuration);
        const latestDay = new Date();
        latestDay.setDate(latestDay.getDate() + 1);

        const statusGraph =
            this.setupGraph('pie', this.language.log_status_rate_title);
        const dayRequestGraph =
            this.setupGraph('line', this.language.log_requests_day_title, this.language.log_time, this.language.log_requests);
        const activeUsersGraph =
            this.setupGraph('bar', this.language.log_active_users_title, this.language.log_users, this.language.log_requests);
        this.requestsKHM =
            this.setupGraph('line', this.language.log_requests + ' KHM', this.language.log_time, this.language.log_requests);
        this.requestsSYR =
            this.setupGraph('line', this.language.log_requests + ' SYR', this.language.log_time, this.language.log_requests);

        const status = [this.language.log_status_200, this.language.log_status_300, this.language.log_status_400,
        this.language.log_status_401, this.language.log_status_403, this.language.log_status_404];
        // Set up status graph values
        for (let date = oldestDate; date <= latestDate; date++) {
            statusGraph.values[date] = [
                { date: date, name: status[0], unit: status[0], value: 0 },
                { date: date, name: status[1], unit: status[1], value: 0 },
                { date: date, name: status[2], unit: status[2], value: 0 },
                { date: date, name: status[3], unit: status[3], value: 0 },
                { date: date, name: status[4], unit: status[4], value: 0 },
                { date: date, name: status[5], unit: status[5], value: 0 }];
        }

        const requestGraphs = [dayRequestGraph, this.requestsKHM, this.requestsSYR];
        // Set up request per day and per country graphs values
        for (const date = new Date(oldestDay.getTime()); date <= latestDay; date.setDate(date.getDate() + 1)) {
            const formatDatePipe = datePipe.transform(date, 'dd-MM-yyyy');
            requestGraphs.forEach((graph: any) => {
                graph.values[formatDatePipe] =
                    [{ date: formatDatePipe, name: this.language.log_requests, unit: this.language.log_requests, value: 0 }];
            });
        }

        this.logs.forEach((log: Log) => {
            const formatDatePipe = datePipe.transform(log.get<Date>('date'), 'dd-MM-yyyy');

            // Fill status pie graph
            statusGraph.values[log.get<Date>('date').getFullYear()][status.indexOf(log.get<string>('status'))].value++;

            // Fill requests per day and per country graph
            if (this.requestsKHM.values[formatDatePipe]) {
                dayRequestGraph.values[formatDatePipe][0].value++;
                if (log.get<string>('country') === 'KHM') {
                    this.requestsKHM.values[formatDatePipe][0].value++;
                }
                if (log.get<string>('country') === 'SYR') {
                    this.requestsSYR.values[formatDatePipe][0].value++;
                }
            }

            // Fill most active users graph
            if (activeUsersGraph.values[log.get<string>('user')]) {
                activeUsersGraph.values[log.get<string>('user')][0].value++;
            } else {
                activeUsersGraph.values[log.get<string>('user')] = [{ name: log.get<string>('user'), value: 1, unit: 'requests' }];
            }
        });

        // Sort most active users by their amount of requests
        activeUsersGraph.values = Object.keys(activeUsersGraph.values)
            .sort((user1, user2) => activeUsersGraph.values[user2][0].value - activeUsersGraph.values[user1][0].value)
            .reduce((_sortedObj, key) => ({ ..._sortedObj, [key]: activeUsersGraph.values[key] }), {});

        // Push the graphs into the list of graphs
        this.graphs.push(statusGraph);
        this.graphs.push(dayRequestGraph);
        this.graphs.push(activeUsersGraph);
    }

    setupGraph(type: string, name: string, xLabel?: string, yLabel?: string) {
        return {
            type: type,
            name: name,
            xLabel: xLabel,
            yLabel: yLabel,
            values: {}
        };
    }

    openDialog(dialogDetails: any): void {
        this.modalService.openDialog(Log, this.logService, dialogDetails);
    }
}
