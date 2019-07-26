import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language/language.service';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {

    public forgotMessage = false;
    public loader = false;
    public form: FormGroup;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public languageService: LanguageService,
    ) { }

    ngOnInit() {

    }
}

