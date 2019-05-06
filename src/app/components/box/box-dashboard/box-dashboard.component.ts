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

  public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;


  constructor(
    private router: Router,
    public languageService: LanguageService,

  ) { }

  changeRoute(route): void {
    this.router.navigate([route]);
  }
}
