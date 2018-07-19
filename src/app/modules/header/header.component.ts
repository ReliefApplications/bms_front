import { Component, OnInit, Input, Output, EventEmitter     } from '@angular/core';
import { ActivatedRoute                                     } from '@angular/router';

import { GlobalText                                         } from '../../../texts/global';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public header = GlobalText.TEXTS;
  public language = "english";

  @Input() currentComponent;
  @Input() currentRoute = "";
  @Output() emitLogOut = new EventEmitter();
  public oldRoute = "";
  public oldComponent;
  public routeParsed : Array<string> = [this.header.header_home];
  public adminMenuOpen = false;

  constructor(
  ) { }

  ngOnInit() {
    console.log(this.constructor.name.toLowerCase());
  }

  /**
  * check if the current page has changed
  * and update the new path displayed in the header
  * and check if the langage has changed
  */
  ngDoCheck(){
    if(this.currentComponent != this.oldComponent){
      this.createRoute(this.currentComponent);
      this.oldComponent = this.currentComponent;
      if((this.currentComponent in GlobalText.TEXTS) && (GlobalText.TEXTS[this.currentComponent] == GlobalText.TEXTS.login_title)){
        this.adminMenuOpen =false;
      }
    }
    if (this.header != GlobalText.TEXTS) {
      this.header = GlobalText.TEXTS;
      this.createRoute(this.currentComponent);
    }
  }

  /**
   * get the name of the current in the right language
   * using the key 'currentComponent'
   * @param currentComponent 
   */
  createRoute(currentComponent): void{
    this.routeParsed = []
    this.routeParsed.push(this.header.header_home);
    if(this.currentComponent in GlobalText.TEXTS){
      this.routeParsed.push(GlobalText.TEXTS[this.currentComponent]);
    }
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
