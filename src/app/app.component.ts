import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { environment } from 'src/environments/environment';
import { UserService } from './core/api/user.service';
import { Language } from './core/language/language';
import { LanguageService } from './core/language/language.service';
import { ScreenSizeService } from './core/screen-size/screen-size.service';
import { UpdateService } from './core/service-worker/update.service';
import { Country } from './models/country';

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
    public viewReady = false;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    // Subscriptions
    subscriptions: Array<Subscription>;


    constructor(
        public router: Router,
        public dialog: MatDialog,
        public userService: UserService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
        private updateService: UpdateService,
    ) { }

    @HostListener('window:resize')
    onResize() {
        this.screenSizeService.onScreenSizeChange();
    }

    ngOnInit() {
        this.subscriptions = [
            this.languageService.languageSubject.subscribe((language: Language) => {
                this.language = language;
            }),
            this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
                this.currentDisplayType = displayType;
                this.handleChat();
            }),
            this.router.events.subscribe((event: Event) => {
                if (event instanceof NavigationEnd) {
                    this.handleChat();
                    this.viewReady = true;
                }
            }),
            this.updateService.checkForUpdates().subscribe()
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription: Subscription) => {
            subscription.unsubscribe();
        });
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


    // Chat should only be shown in prod, on the dashboard page and in desktop mode
    public chatShouldBeDisplayed(): boolean {
        return environment.production && this.router.url === '/' && this.currentDisplayType.type !== 'mobile';
    }

    private handleChat(): void {
        const chat = document.getElementById('chat-widget-container');
        if (chat) {
            if (!this.chatShouldBeDisplayed()) {
                chat.style.display = 'none';
                return;
            }
            chat.style.display = 'block';
        }
    }
}
