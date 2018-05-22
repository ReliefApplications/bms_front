import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URL_BMS_API } from '../environments/environment';

import { AuthenticationService } from './core/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BMS';
  users: any;

  username: string;
  password: string;

  constructor(
    private http: HttpClient,
	public _authService: AuthenticationService
  ) { }

  getUsers() {
    this.http.get(URL_BMS_API + '/users').subscribe(res => {
      this.users = res;
    })
  }

  login() {
	  this._authService.login(this.username, this.password);
  }
}
