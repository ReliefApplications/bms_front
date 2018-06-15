import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'menu-item-box',
  templateUrl: './menu-item-box.component.html',
  styleUrls: ['./menu-item-box.component.scss']
})
export class MenuItemBoxComponent implements OnInit {

  @Input() info: any;
  @Input() activeTitle;
  @Output() emitActive = new EventEmitter<string>();

  constructor(
    public router: Router    
  ) { }

  ngOnInit() {
  }

  changeRoot(route){
    this.router.navigate(['/'+route]);
    this.emitActive.emit(route);
  }

}
