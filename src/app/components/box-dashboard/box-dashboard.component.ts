import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-box-dashboard',
  templateUrl: './box-dashboard.component.html',
  styleUrls: ['./box-dashboard.component.scss']
})
export class BoxDashboardComponent implements OnInit {

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
