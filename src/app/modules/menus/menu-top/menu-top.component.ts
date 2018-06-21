import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-menu-top',
  templateUrl: './menu-top.component.html',
  styleUrls: ['./menu-top.component.scss']
})
export class MenuTopComponent implements OnInit {
  @Input() openMenu;
  @Output() emitCloseMenu = new EventEmitter<boolean>();
  @Output() emitCurrentRoute = new EventEmitter<string>();
  public activeTitle = "";

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

  setCurrentRoute(route){
    this.activeTitle = "/"+route;
    this.emitCloseMenu.emit(true);
  }
  
  closeTopMenu(){
    this.emitCloseMenu.emit(true);
  }
}
