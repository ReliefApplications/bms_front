import { Component } from '@angular/core';
import { UserInterface } from './model/interfaces';
import { AuthenticationService } from './core/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  user: UserInterface = new UserInterface();
  public menuHover = false;

  constructor(
    private _authenticationService: AuthenticationService
  ) { }

  ngOnInit(){
    this.getUser();
  }

  getUser(): UserInterface {
    if (this.user.user_id) {
        return this.user;
    }
    this.user = this._authenticationService.getUser();
    return this.user;
  }

  hoverMenu(){
    this.menuHover = true;
  }

  outMenu(){
    this.menuHover = false;
  }
}
