import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header-menu-top',
  templateUrl: './header-menu-top.component.html',
  styleUrls: ['./header-menu-top.component.scss']
})
export class HeaderMenuTopComponent implements OnInit {
  @Output() emitOpenMenu = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  openTopMenu(): void{
    this.emitOpenMenu.emit(true);
  }
}
