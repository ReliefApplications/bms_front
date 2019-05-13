import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/api/user.service';
import { LanguageService } from 'src/app/core/language/language.service';
@Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

    public enabledReports: Array<object>;

    constructor(
        private userService: UserService,
        public languageService: LanguageService,
    ) {}

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;


    ngOnInit(): void {
        this.generateEnabledReports();
    }

    private generateEnabledReports() {
        if (this.userService.hasRights('ROLE_REPORTING_COUNTRY')) {
            this.enabledReports.push(
                {
                    icon: 'settings/api',
                    title: this.language.report_country_report,
                },
            );
        }
        if (this.userService.hasRights('ROLE_REPORTING_PROJECT')) {
            this.enabledReports.push(
                {
                    icon: 'reporting/projects',
                    label: this.language.report_project_report,
                },
            );
        }

        this.enabledReports.push(
            {
                icon: 'reporting/distribution',
                label: this.language.report_distribution_report,
            },
        );
    }


}
