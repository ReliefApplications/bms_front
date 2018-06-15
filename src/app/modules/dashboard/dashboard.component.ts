import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URL_BMS_API } from '../../../environments/environment';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: any;

  constructor(
      private http: HttpClient,
      private _authenticationService: AuthenticationService,
      private router : Router     
  ) { }

  ngOnInit() {
    let user = this._authenticationService.getUser();
    if (!user.loggedIn) {
      this.router.navigate(['/login']);
    }
  }

}
