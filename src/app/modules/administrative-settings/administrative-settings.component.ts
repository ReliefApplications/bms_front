import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsComponent } from 'src/app/components/settings/settings.component';
import { LanguageService } from 'src/app/core/language/language.service';


@Component({
    selector: 'app-administrative-settings',
    templateUrl: './administrative-settings.component.html',
    styleUrls: ['./administrative-settings.component.scss']
})
export class AdministrativeSettingsComponent implements OnInit {
    public nameComponent = 'administrative-settings';

    selectedTitle = '';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    @ViewChild(SettingsComponent) settings: SettingsComponent;


    constructor(public languageService: LanguageService) { }

    ngOnInit() {
        this.selectTitle('users');
    }

    selectTitle(title): void {
      this.settings.getData(title);
      this.selectedTitle = title;
    }
}
