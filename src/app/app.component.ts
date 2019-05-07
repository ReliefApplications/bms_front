import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DisplayType } from 'src/constants/screen-sizes';
import { UserService } from './core/api/user.service';
import { Language } from './core/language/language';
import { LanguageService } from './core/language/language.service';
import { ScreenSizeService } from './core/screen-size/screen-size.service';
import { Country } from './model/country';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    public countries: Array<Country>;


    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public router: Router,
        public dialog: MatDialog,
        public userService: UserService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
    ) { }

    @HostListener('window:resize')
    onResize() {
        this.screenSizeService.onScreenSizeChange();
    }

    ngOnInit() {
        this.languageService.languageSubject.subscribe((language: Language) => {
            this.language = language;
        });

        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
    }

    ngOnDestroy() {
        this.languageService.languageSubject.unsubscribe();
        this.screenSizeSubscription.unsubscribe();
    }

    matchUrl(): string {
        const match = this.router.url.split('/');
        match.shift();
        return match[0];
    }
}
