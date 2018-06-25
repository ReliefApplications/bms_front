import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit {

  @Input() info: any;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  changeRoot(route): void{
    this.router.navigate([route]);
  }
}
