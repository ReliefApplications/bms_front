import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'BMS';
  users: any;

  constructor(
    private http: HttpClient
  ) { }

  getUsers() {
    this.http.get("http://bms-api.eu-central-1.elasticbeanstalk.com/users").subscribe(res => {
      this.users = res;
    })
  }

}
