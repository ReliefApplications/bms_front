import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BoxComponent } from '../box.component';

@Component({
  selector: 'app-box-dashboard',
  templateUrl: './box-dashboard.component.html',
  styleUrls: ['./box-dashboard.component.scss']
})
export class BoxDashboardComponent extends BoxComponent {

  ngOnInit() {
  }
}
