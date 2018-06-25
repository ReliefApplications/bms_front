import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() currentRoute = "";
  @Output() emitLogOut = new EventEmitter();
  public oldRoute = "";
  public home = "Home";
  public routeParsed : Array<string> = [this.home];
  public adminMenuOpen = false;

  constructor() { }

  ngOnInit() {
  }

  /**
  * check if the current page has changed
  * and update the new path displayed in the header
  */
  ngDoCheck(){
    if(this.currentRoute != this.oldRoute){
      this.parseRoute(this.currentRoute);
      this.oldRoute = this.currentRoute;
      if(this.currentRoute == "/login"){
        this.adminMenuOpen =false;
      }
    }
  }

  parseRoute(currentRoute): void{
    this.routeParsed = currentRoute.split('/');
    this.routeParsed[0]= this.home;
  }

  openAdminMenu(): void{
    this.adminMenuOpen = !this.adminMenuOpen;
  }

  logOut(): void{
    this.emitLogOut.emit();
  }
}
