import { Component, OnInit } from '@angular/core';
import { LanguageService } from './../../../../texts/language.service';


@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: [ './not-found.component.scss' ]
})
export class NotFoundComponent implements OnInit {
    // Language
    public language = this.languageService.selectedLanguage;
    constructor (
    private languageService: LanguageService,
    ) {}
    ngOnInit() {}
}
