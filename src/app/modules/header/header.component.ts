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
  public language = "en";

  @Input() currentComponent;
  @Input() currentRoute = "";
  @Output() emitLogOut = new EventEmitter();
  public oldRoute = "";
  public oldComponent;
  public routeParsed : Array<string> = [this.header.header_home];

  constructor(
  ) { }

  ngOnInit() {
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

  logOut(): void{
    this.emitLogOut.emit();
  }

  //TO DO : handle multiple languages
  changeLanguage(){
    switch(this.language){
      case "fr" : this.language = "en"; GlobalText.changeLanguage('en'); break;
      case "en" : this.language = "fr"; GlobalText.changeLanguage('fr'); break;
    }
  }
}
