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
  public currentRoute = "";
  public menuHover = false;
  public logOut = false;

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
    if(!this.user.loggedIn){
      this.logOut = true;
    }else{
      this.logOut = false;      
    }
    return this.user;
  }

  hoverMenu(){
    this.menuHover = true;
  }

  outMenu(){
    this.menuHover = false;
  }

  setCurrentRoute(currentRoute){
    this.currentRoute = currentRoute;
  }

  onLogOut(e) {
    this.user.loggedIn = false;
    this._authenticationService.logout();
    this.getUser();
  }

  ngDoCheck(){
    if(this.logOut){
      this.getUser();
    }
  }
}
