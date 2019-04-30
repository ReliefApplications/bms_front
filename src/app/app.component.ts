import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Language } from 'src/texts/language';
import { LanguageService } from 'src/texts/language.service';
import { UserService } from './core/api/user.service';
import { Country } from './model/country';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    public smallScreenMode = false;
    public maxHeight = 600;
    public maxWidth = 750;

    public isShowing = false;

    public countries: Array<Country>;


    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public router: Router,
        public dialog: MatDialog,
        public userService: UserService,
        private languageService: LanguageService,
    ) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    ngOnInit() {
        this.languageService.languageSubject.subscribe((language: Language) => {
            this.language = language;
        });
        this.checkSize();
    }

    ngOnDestroy() {
        this.languageService.languageSubject.unsubscribe();
    }

    change() {
        if (!this.smallScreenMode) {
            this.isShowing = !this.isShowing;
        }
    }

    checkSize(): void {
        if (this.smallScreenMode === false && ((window.innerHeight < this.maxHeight) || (window.innerWidth < this.maxWidth))) {
            this.smallScreenMode = true;
            this.isShowing = true;
            // TODO: REDO MARGINS
            // GlobalText.resetMenuMargin();
        } else if (this.smallScreenMode === true && (window.innerHeight > this.maxHeight) && (window.innerWidth > this.maxWidth)) {
            this.smallScreenMode = false;
        }
        if ((window.innerHeight > this.maxHeight) && (window.innerWidth > this.maxWidth)) {
            this.isShowing = false;
        }
    }

    toggle(sidenav) {
        if (this.smallScreenMode) {
            sidenav.toggle();
        }
    }

    matchUrl(): string {
        const match = this.router.url.split('/');
        match.shift();
        return match[0];
    }
}
