import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { GlobalText                                         } from '../../../texts/global';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public header = GlobalText.TEXTS;
  public language = "english";

  @Input() currentRoute = "";
  @Output() emitLogOut = new EventEmitter();
  public oldRoute = "";
  public routeParsed : Array<string> = [this.header.header_home];
  public adminMenuOpen = false;

  constructor() { }

  ngOnInit() {
  }

  /**
  * check if the current page has changed
  * and update the new path displayed in the header
  * and check if the langage has changed
  */
  ngDoCheck(){
    if(this.currentRoute != this.oldRoute){
      this.parseRoute(this.currentRoute);
      this.oldRoute = this.currentRoute;
      if(this.currentRoute == "/login"){
        this.adminMenuOpen =false;
      }
    }
    if (this.header != GlobalText.TEXTS) {
      this.header = GlobalText.TEXTS;
      this.parseRoute(this.currentRoute);
    }
  }

  parseRoute(currentRoute): void{
    this.routeParsed = currentRoute.split('/');
    this.routeParsed[0]= this.header.header_home;
  }

  openAdminMenu(): void{
    this.adminMenuOpen = !this.adminMenuOpen;
  }

  logOut(): void{
    this.emitLogOut.emit();
  }

  //TO DO : handle multiple languages
  changeLanguage(){
    switch(this.language){
      case "francais" : this.language = "english"; GlobalText.changeLanguage('en'); break;
      case "english" : this.language = "francais"; GlobalText.changeLanguage('fr'); break;
    }
  }
}
