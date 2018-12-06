import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';

import { GlobalText } from '../../../../texts/global';

import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/core/api/user.service';
import { forEach } from '@angular/router/src/utils/collection';
import { ProjectService } from 'src/app/core/api/project.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public header = GlobalText.TEXTS;
    public language = "en";

    // User countries
    userData = new User();
    requesting = false;
    countries : string[] = [];
    selectedCountry : string;

    @Output() emitLogOut = new EventEmitter();
    @Input() actualUserId : number;

    public currentRoute = "/";
    public breadcrumb: Array<any> = [{
        'route': "/",
        'name': this.header.header_home
    }];

    constructor(
        public dialog: MatDialog,
        public router: Router,
        private userService: UserService,
        private asyncacheService: AsyncacheService,
    ) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = event.url;
                if (this.currentRoute.indexOf("?") > -1) {
                    this.currentRoute = this.currentRoute.substring(0, this.currentRoute.indexOf('?'));
                }
                this.updateBreadcrumb();

            }
        })
    }

    ngOnInit() {
        this.language = GlobalText.language;
    }

    ngDoCheck() {
        if (this.header !== GlobalText.TEXTS) {
            this.header = GlobalText.TEXTS;
            this.updateBreadcrumb();
        }
        this.refreshUserData();
    }

    refreshUserData() {
        if( !this.requesting && this.actualUserId && Number(this.userData.id) !== Number(this.actualUserId)) {
            this.requesting = true;
            this.userService.get().subscribe(
                result => {
                    if(result) {
                        result.forEach(
                            element => {
                                if(element.id === this.actualUserId) {
                                    this.userData = User.formatFromApi(element);
                                    console.log(this.userData)
                                    this.requesting = false;
                                }
                            }
                        );
                        this.getCorrectCountries();
                    }
                }
            )
        }
    }

    getCorrectCountries() {
        console.log('gets: ', this.userData.rights);
        let countries = this.userData.getAllCountries();

        this.countries = [];
        if(this.userData.rights === "ROLE_ADMIN") {
            countries.forEach( element => {
                this.countries.push(element.id);
            });
        } else if(this.userData.rights === "ROLE_REGIONAL_MANAGER" || this.userData.rights === "ROLE_COUNTRY_MANAGER") {
            this.userData.country.forEach( element => {
                this.countries.push(element);
            });
        } else if(this.userData.rights === "ROLE_PROJECT_MANAGER" || this.userData.rights === "ROLE_PROJECT_OFFICER") {
            this.userData.country.forEach( element => {
                this.countries.push(element);
            });
        }
        this.selectCountry(this.countries[0]);
    }

    selectCountry(c: string) {
        if(c) {
            this.selectedCountry = c;
            // TODO: SET NEW COUNTRY IN CACHE TO ACCESS IT EVERYWHERE
            this.asyncacheService.set(AsyncacheService.COUNTRY, this.selectedCountry);
        }
    }

    getFlag(c: string) {
        let url = '';

        if(c) {
            url = ("assets/images/" + c + ".png");
        } else {
            url = ("assets/images/defaultFlag.png");
        }

        return(url);
    }

    /**
     * Update the breadcrumb according to the current route
     */
    updateBreadcrumb() {
        let parsedRoute = this.currentRoute.split('/');

        this.breadcrumb = [{
            'route': "/",
            'name': this.header.header_home
        }];

        parsedRoute.forEach((item, index) => {
            if (index > 0 && item !== "") {
                if (isNaN(+item)) {
                    let breadcrumbItem = {
                        'route': this.breadcrumb[index - 1].route + (index === 1 ? "" : "/") + item,
                        'name': this.header["header_" + item]
                    }
                    this.breadcrumb.push(breadcrumbItem);
                } else {
                    let length = this.breadcrumb.length;
                    this.breadcrumb[length - 1].route = this.breadcrumb[length - 1].route + "/" + item;
                }
            }
        });
    }

    logOut(): void {
        this.emitLogOut.emit();
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action == 'language') {
            dialogRef = this.dialog.open(ModalLanguageComponent, {
                width: "40%",
            });
        }

        dialogRef.afterClosed().subscribe(result => {
            this.language = GlobalText.language;
        });
    }
}
