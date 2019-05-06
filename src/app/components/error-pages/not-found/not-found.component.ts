import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';


@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: [ './not-found.component.scss' ]
})
export class NotFoundComponent implements OnInit {
    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;
    constructor (
    public languageService: LanguageService,
    ) {}
    ngOnInit() {}
}
