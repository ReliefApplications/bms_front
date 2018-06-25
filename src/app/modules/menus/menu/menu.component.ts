import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
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

  setCurrentRoute(route): void{
    this.activeTitle = "/"+route;
  }
}
