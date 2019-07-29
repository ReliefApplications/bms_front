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

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit, OnDestroy {

  public logClass = Log;
  public logs: Log[];
  public logData: MatTableDataSource<Log>;
  public loadingLog = true;

  @ViewChild(TableComponent) table: TableComponent;
  @ViewChild(TableMobileComponent) tableMobile: TableMobileComponent;

  public displayedTable = this.table;

  // Screen size
  public currentDisplayType: DisplayType;
  private screenSizeSubscription: Subscription;

  constructor(
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
                this.logData = new MatTableDataSource(this.logs);
            } else if (response === null) {
                this.logs = null;
            }
        }
    );
}

}
