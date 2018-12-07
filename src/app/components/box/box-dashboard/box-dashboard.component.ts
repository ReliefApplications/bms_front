import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalText } from 'src/texts/global';

@Component({
  selector: 'app-box-dashboard',
  templateUrl: './box-dashboard.component.html',
  styleUrls: ['./box-dashboard.component.scss']
})
export class BoxDashboardComponent {
  @Input() info: any;

  public box = GlobalText.TEXTS;
  
  constructor(
    private router: Router,
  ) { }

  changeRoute(route): void {
    this.router.navigate([route]);
  }
}
