import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'menu-item-box',
  templateUrl: './menu-item-box.component.html',
  styleUrls: ['./menu-item-box.component.scss']
})
export class MenuItemBoxComponent implements OnInit {

  @Input() info: any;

  constructor(
    public router: Router    
  ) { }

  ngOnInit() {
  }

  changeRoot(route){
    this.router.navigate(['/'+route]);
  }

}
