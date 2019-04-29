import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Country } from 'src/app/model/user.new';
import { LanguageService } from 'src/texts/language.service';
import { UserService } from './core/api/user.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public smallScreenMode = false;
    public maxHeight = 600;
    public maxWidth = 750;

    public isShowing = false;

    public countries: Array<Country>;


    // Language
    public language = this.languageService.selectedLanguage;

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
}
