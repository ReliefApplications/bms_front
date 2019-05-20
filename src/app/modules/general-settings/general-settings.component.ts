import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsComponent } from 'src/app/components/settings/settings.component';
import { LanguageService } from 'src/app/core/language/language.service';


@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {
    public nameComponent = 'general-settings';

    selectedTitle = '';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    @ViewChild(SettingsComponent) settings: SettingsComponent;


    constructor(public languageService: LanguageService) { }

    ngOnInit() {
        this.selectTitle('users');
    }

    selectTitle(title): void {
      if (this.settings.httpSubscriber) {
        this.settings.httpSubscriber.unsubscribe();
      }
      this.settings.getData(title);
      this.selectedTitle = title;
    }
}
