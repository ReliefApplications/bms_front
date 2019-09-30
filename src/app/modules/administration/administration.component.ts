import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingsComponent } from 'src/app/components/settings/settings.component';
import { LanguageService } from 'src/app/core/language/language.service';
import { UserService } from 'src/app/core/api/user.service';


@Component({
    selector: 'app-administration',
    templateUrl: './administration.component.html',
    styleUrls: ['./administration.component.scss']
})
export class AdministrationComponent implements OnInit {
    public nameComponent = 'administration';

    selectedTitle = '';

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    @ViewChild(SettingsComponent, { static: true }) settings: SettingsComponent;


    constructor(
        public languageService: LanguageService,
        public userService: UserService
    ) { }

    ngOnInit() {
        if (this.userService.hasRights('ROLE_USER_MANAGEMENT')) {
            this.selectTitle('users');
        } else {
            this.selectTitle('donors');
        }
    }

    selectTitle(title): void {
      this.settings.getData(title);
      this.selectedTitle = title;
    }
}
