import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NavigationEnd, Router } from '@angular/router';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Country } from 'src/app/model/user.new';
import { LanguageService } from 'src/texts/language.service';
import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';
import { Language } from './../../../../texts/language';
import { UserService } from './../../../core/api/user.service';
import { AuthenticationService } from './../../../core/authentication/authentication.service';



@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent implements OnInit {

    // User countries
    requesting = false;
    countries: string[] = [];
    selectedCountry: string;

    @Output() emitLogOut = new EventEmitter();

    public currentRoute = '/';


    // Tooltip
    public tooltip;

    // Language
    public language: Language;

    // public breadcrumb: Array<any> = [
    //     {
    //         route: '/',
    //         name: this.language.home
    //     }
    // ];

    constructor(
        public dialog: MatDialog,
        public router: Router,
        private userService: UserService,
        private asyncacheService: AsyncacheService,
        private snackbar: SnackbarService,
        private languageService: LanguageService,
        private authenticationService: AuthenticationService,
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = event.url;
                if (this.currentRoute.indexOf('?') > -1) {
                    this.currentRoute = this.currentRoute.substring(0, this.currentRoute.indexOf('?'));
                }
                if (this.language) {
                    this.updateTooltip();
                }
            }
        });
    }

    ngOnInit() {

        this.getCorrectCountries();

        // if (this.breadcrumb.length === 1) {
        //     this.currentRoute = this.router.url;
        //     if (this.currentRoute.indexOf('?') > -1) {
        //         this.currentRoute = this.currentRoute.substring(0, this.currentRoute.indexOf('?'));
        //     }
        //     this.updateBreadcrumb();
        // }
    }

    getCorrectCountries() {
        const user = this.userService.currentUser;
        this.countries = [];
        if (!user) {
            return;
        }
        if (this.userService.hasRights('ROLE_SWITCH_COUNTRY')) {
            this.userService.currentUser.getOptions('countries').forEach((country: Country) => {
                this.countries.push(country.get('id'));
            });
        }
        else {
            this.userService.currentUser.get<Country[]>('countries').forEach((element) => {
                this.countries.push(element.get('id'));
            });
        }


        this.asyncacheService.get(AsyncacheService.COUNTRY).subscribe((result) => {
            if (result) {
                this.setLanguage(result);
            } else {
                this.setLanguage(this.countries[0]);
            }

            this.updateTooltip();

        });
    }

    // selectCountry(c: string) {
    //     if (c) {
    //         if (!this.selectedCountry || !this.language.country) {
    //             this.autoLanguage(c);
    //         } else if (GlobalText.country && this.selectedCountry && c !== this.selectedCountry) {
    //             this.preventSnack(c);
    //         }

    //         this.selectedCountry = c;
    //         GlobalText.country = c;
    //         this.asyncacheService.set(AsyncacheService.COUNTRY, this.selectedCountry);
    //     }
    // }

    setLanguage(c: string) {
        const userLanguage = this.userService.currentUser.get<string>('language');
        if (!userLanguage) {
            if (c === 'SYR') {
                this.languageService.selectedLanguage = this.languageService.stringToLanguage('ar');
            } else if (c === 'KHM') {
                this.languageService.selectedLanguage = this.languageService.stringToLanguage('en');
            }
        } else {
            this.languageService.selectedLanguage = this.languageService.stringToLanguage(userLanguage);
        }
        this.language = this.languageService.selectedLanguage;
    }

    preventSnack(country: string) {
        const snack = this.snackbar.info(
            'Page is going to reload in 3 sec to switch to ' + country + ' country. ',
            'Reload'
        );

        snack.onAction().subscribe(() => {
            window.location.reload();
        });

        snack.afterDismissed().subscribe(() => {
            window.location.reload();
        });
    }
    // TODO: fix breadcrumbs
    /**
     * Update the breadcrumb according to the current route
     */
    // updateBreadcrumb() {
    //     const parsedRoute = this.currentRoute.split('/');

    //     this.breadcrumb = [
    //         {
    //             route: '/',
    //             name: this.header.home
    //         }
    //     ];

    //     parsedRoute.forEach((item, index) => {
    //         if (index > 0 && item !== '') {
    //             if (isNaN(+item)) {
    //                 const breadcrumbItem = {
    //                     route: this.breadcrumb[index - 1].route + (index === 1 ? '' : '/') + item,
    //                     name: this.header['header_' + item]
    //                 };
    //                 this.breadcrumb.push(breadcrumbItem);
    //             } else {
    //                 const length = this.breadcrumb.length;
    //                 this.breadcrumb[length - 1].route = this.breadcrumb[length - 1].route + '/' + item;
    //             }
    //         }
    //     });
    // }

    /**
     * Update the text of the tooltip
     */
    updateTooltip() {
        const parsedRoute = this.currentRoute.split('/').filter((element) => isNaN(parseInt(element, 10)));
        const page = parsedRoute[parsedRoute.length - 1];

        if (page === '') {
            this.tooltip = this.language.tooltip_dashboard;
        } else {
            this.tooltip = this.language['tooltip_' + page.replace('-', '_')];
        }
    }

    logOut(): void {
        this.authenticationService.logout().subscribe(
            _response => {
                this.userService.currentUser = undefined;
            }
        );
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action === 'language') {
            dialogRef = this.dialog.open(ModalLanguageComponent, {});
        }

        // dialogRef.afterClosed().subscribe((result: Language) => {
        //     this.languageService.changeLanguage(result);
        // });
    }

}
