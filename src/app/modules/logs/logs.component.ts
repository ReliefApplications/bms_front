import { Component, OnInit } from '@angular/core';
import { LogsService } from 'src/app/core/api/logs.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  constructor(
    public logService: LogsService
  ) { }

  ngOnInit() {
    this.logService.get().subscribe();
  }

}
