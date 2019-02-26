import { Component, Input, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalText } from 'src/texts/global';

@Component({
  selector: 'app-box-dashboard',
  templateUrl: './box-dashboard.component.html',
  styleUrls: ['./box-dashboard.component.scss']
})
export class BoxDashboardComponent implements DoCheck {
  @Input() info: any;

  public box = GlobalText.TEXTS;
  public language = GlobalText.language;

  ngDoCheck() {
    this.language = GlobalText.language;
  }

  constructor(
    private router: Router,
  ) { }

  changeRoute(route): void {
    this.router.navigate([route]);
  }
}
