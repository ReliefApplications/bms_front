import { Component, OnInit, Input, Output, EventEmitter       } from '@angular/core';
import { Router, NavigationEnd                                } from '@angular/router';

import { GlobalText                                                 } from '../../../../texts/global';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  public menu = GlobalText.TEXTS;

  @Input() menuHover;
  public activeTitle = "";
  @Output() emitCurrentRoute = new EventEmitter<string>();

  constructor(
    private router : Router
  ) { }

  ngOnInit() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.activeTitle = e.url;
        this.emitCurrentRoute.emit(this.activeTitle);
      }
    })
  }
  
  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.menu != GlobalText.TEXTS) {
      this.menu = GlobalText.TEXTS;
    }
  }
  
  setCurrentRoute(route): void{
    this.activeTitle = "/"+route;
  }
}
