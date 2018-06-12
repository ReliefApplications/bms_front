import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URL_BMS_API } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: any;

  constructor(
	    private http: HttpClient
  ) { }

  ngOnInit() {
  }

  getUsers() {
    this.http.get(URL_BMS_API + '/users').subscribe(res => {
      this.users = res;
    })
  }

}
