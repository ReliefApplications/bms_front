import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NavigationEnd, Router } from '@angular/router';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Country } from 'src/app/model/user.new';
import { LanguageService } from 'src/texts/language.service';
import { GlobalText } from '../../../../texts/global';
import { UserService } from './../../../core/api/user.service';



@Component({
    selector: 'app-header-mobile',
    templateUrl: './header-mobile.component.html',
    styleUrls: [ './header-mobile.component.scss' ]
})
export class HeaderMobileComponent implements OnInit {

    // User countries
    requesting = false;
    countries: string[] = [];
    selectedCountry: string;

    @Output() emitLogOut = new EventEmitter();

    public currentRoute = '/';

    // Language
    public language = this.languageService.selectedLanguage;

    public breadcrumb: Array<any> = [
        {
            route: '/',
            name: this.language.home
        }
    ];

    // Tooltip
    public tooltip;

    constructor(
        public dialog: MatDialog,
        public router: Router,
        private userService: UserService,
        private asyncacheService: AsyncacheService,
        private snackbar: SnackbarService,
        private languageService: LanguageService,
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = event.url;
                if (this.currentRoute.indexOf('?') > -1) {
                    this.currentRoute = this.currentRoute.substring(0, this.currentRoute.indexOf('?'));
                }
                // this.updateBreadcrumb();
                this.updateTooltip();
            }
        });
    }

    ngOnInit() {
        this.getCorrectCountries();
        this.updateTooltip();

        if (this.breadcrumb.length === 1) {
            this.currentRoute = this.router.url;
            if (this.currentRoute.indexOf('?') > -1) {
                this.currentRoute = this.currentRoute.substring(0, this.currentRoute.indexOf('?'));
            }
            // this.updateBreadcrumb();
        }
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
            this.userService.currentUser.get<Country[]>('country').forEach((element) => {
                this.countries.push(element.get('id'));
            });
        }

        this.asyncacheService.get(AsyncacheService.COUNTRY).subscribe((result) => {
            if (result) {
                this.selectCountry(result);
            } else {
                this.selectCountry(this.countries[0]);
            }
        });
    }

    selectCountry(c: string) {
        if (c) {
            if (!this.selectedCountry || !GlobalText.country) {
                // this.autoLanguage(c);
            } else if (GlobalText.country && this.selectedCountry && c !== this.selectedCountry) {
                this.preventSnack(c);
            }

            this.selectedCountry = c;
            GlobalText.country = c;
            this.asyncacheService.set(AsyncacheService.COUNTRY, this.selectedCountry);
        }
    }

    // autoLanguage(c: string) {
    //     if (!this.userService.currentUser.get<string>('language')) {
    //         if (c === 'SYR') {
    //             GlobalText.changeLanguage('ar');
    //         } else if (c === 'KHM') {
    //             GlobalText.changeLanguage('en');
    //         }
    //     }
    // }

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
            this.tooltip = this.language['tooltip_dashboard'];
        } else {
            this.tooltip = this.language['tooltip_' + page.replace('-', '_')];
        }
    }

    logOut(): void {
        this.emitLogOut.emit();
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        // let dialogRef;

        // if (user_action === 'language') {
        //     dialogRef = this.dialog.open(ModalLanguageComponent, {});
        // }

        // dialogRef.afterClosed().subscribe((result) => {
        //     this.language = GlobalText.language;
        // });
    }

}
