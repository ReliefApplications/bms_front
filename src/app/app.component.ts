import { Component, HostListener } from '@angular/core';
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
  public logOut = true;
  public openTopMenu = false;
  public smallScreenMode;
  public maxHeight = 700;
  public maxWidth = 750;

  constructor(
    private _authenticationService: AuthenticationService
  ) { }

  ngOnInit(){
    this.checkSize();
    this.getUser();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void{
    if((window.innerHeight < this.maxHeight)||(window.innerWidth < this.maxWidth))
    {
      this.smallScreenMode = true;
    } 
    else{
      this.smallScreenMode = false;
    }
  }

  getUser(): UserInterface {
    if (this.user.id) {
      if(!this.user.loggedIn){
        this.logOut = true;
      }else{
        this.logOut = false;      
      }
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

  hoverMenu(): void{
    this.menuHover = true;
  }

  outMenu(): void{
    this.menuHover = false;
  }

  setCurrentRoute(currentRoute): void{
    this.currentRoute = currentRoute;
  }

  onLogOut(e): void{
    this.user.loggedIn = false;
    this._authenticationService.logout();
    this.getUser();
  }

  ngDoCheck(): void{
    if(this.logOut){
      this.getUser();
    }
  }

  clickOnTopMenu(e): void{
    this.openTopMenu = !this.openTopMenu;
  }
}
