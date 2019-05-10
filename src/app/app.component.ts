import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DisplayType } from 'src/constants/screen-sizes';
import { environment } from 'src/environments/environment';
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

    public extendedSideNav = false;

    public countries: Array<Country>;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    // Environment
    public environmentIsProduction = environment.production;


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
            this.handleChat();
        });

        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.handleChat();
            }
        });

    }

    ngOnDestroy() {
        this.languageService.languageSubject.unsubscribe();
        this.screenSizeSubscription.unsubscribe();
    }

    closeSideNav() {
        if (this.extendedSideNav) {
            this.extendedSideNav = false;
        }
    }

    matchUrl(): string {
        const match = this.router.url.split('/');
        match.shift();
        return match[0];
    }

    private handleChat(): void {
        const chat =  document.getElementById('chat-widget-container');
        if (chat) {

            if (this.currentDisplayType.type === 'mobile') {
                chat.style.display = 'none';
                return;
            }

            if (this.router.url !== '/') {
                chat.style.display = 'none';
                return;
            }

            chat.style.display = 'block';


        }
    }
}
