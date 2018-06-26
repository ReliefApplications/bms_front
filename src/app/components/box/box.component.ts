import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit {
  @Input() selectedTitle;
  @Input() info: any;
  @Output() emitClickedTitle = new EventEmitter<string>();

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  changeRoute(route): void{
    this.router.navigate([route]);
  }

  emitTitle(title){
    this.emitClickedTitle.emit(title);
  }
}
