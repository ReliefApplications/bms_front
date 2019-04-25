import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from 'src/texts/language.service';

@Component({
  selector: 'app-box-dashboard',
  templateUrl: './box-dashboard.component.html',
  styleUrls: ['./box-dashboard.component.scss']
})
export class BoxDashboardComponent {
  @Input() info: any;

  public language = this.languageService.selectedLanguage;


  constructor(
    private router: Router,
    private languageService: LanguageService,

  ) { }

  changeRoute(route): void {
    this.router.navigate([route]);
  }
}
