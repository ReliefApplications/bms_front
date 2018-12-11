import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { GlobalText } from '../../../../texts/global';

import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';
import { UserService } from 'src/app/core/api/user.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';

@Component({
    selector: 'app-header-mobile',
    templateUrl: './header-mobile.component.html',
    styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit {

    public header = GlobalText.TEXTS;
    public language = "en";
    private requesting = false;
    private userData = new User();
    public countries = [ ];
    public selectedCountry: string;

    @Output() emitLogOut = new EventEmitter();
    @Output() emitCurrentRoute = new EventEmitter<string>();
    @Output() emitToggle = new EventEmitter();
    @Input() actualUserId: number;

    constructor(
        public dialog: MatDialog,
        private userService: UserService,
        private asyncacheService: AsyncacheService,
        private snackbar: MatSnackBar
    ) { }

    ngOnInit() {
        this.language = GlobalText.language;
    }

    logOut(): void {
        this.emitLogOut.emit();
    }

    ngDoCheck() {
        if (this.header !== GlobalText.TEXTS) {
            this.header = GlobalText.TEXTS;
        }
        this.refreshUserData();

        if(this.language !== GlobalText.language) {
            this.ngOnInit();
        }
    }

    setCurrentRoute(route: string) {
        this.emitCurrentRoute.emit(route);
    }

    toggle() {
        this.emitToggle.emit();
    }

    refreshUserData() {
        if (!this.requesting && this.actualUserId && Number(this.userData.id) !== Number(this.actualUserId)) {
            this.requesting = true;
            this.userService.get().subscribe(
                result => {
                    if (result) {
                        result.forEach(
                            element => {
                                if (element.id === this.actualUserId) {
                                this.userData = User.formatFromApi(element);
                                    //console.log(this.userData)
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
        //console.log('gets: ', this.userData.rights);
        let countries = this.userData.getAllCountries();

        this.countries = [];
        if (this.userData.rights === "ROLE_ADMIN") {
            countries.forEach(element => {
                this.countries.push(element.id);
            });
        } else if (this.userData.rights === "ROLE_REGIONAL_MANAGER" || this.userData.rights === "ROLE_COUNTRY_MANAGER") {
            this.userData.country.forEach(element => {
                this.countries.push(element);
            });
        } else if (this.userData.rights === "ROLE_PROJECT_MANAGER" || this.userData.rights === "ROLE_PROJECT_OFFICER") {
            this.userData.country.forEach(element => {
                this.countries.push(element);
            });
        }
        this.asyncacheService.get(AsyncacheService.COUNTRY).subscribe(
            result => {
                if(result) {
                    this.selectCountry(result);
                    this.autoLanguage(result);
                } else {
                    this.selectCountry(this.countries[0]);
                }
            }
        )
    }

    selectCountry(c: string) {
        if(c) {
            if(GlobalText.country && c !== this.selectedCountry) {
                this.preventSnack(c);
            }

            this.selectedCountry = c;
            GlobalText.country = c;
            this.asyncacheService.set(AsyncacheService.COUNTRY, this.selectedCountry);
        }
    }

    autoLanguage(c: string) {
        if(c === "SYR") {
            GlobalText.changeLanguage('ar');
        } else if(c === "KHM") {
            GlobalText.changeLanguage('en');
        }
    }

    getFlag(c: string) {
        let url = '';

        if (c) {
            url = ("assets/images/" + c + ".png");
        } else {
            url = ("assets/images/defaultFlag.png");
        }

        return (url);
    }

    preventSnack(country: string) {
        const snack = this.snackbar.open('Page is going to reload in 3 sec to switch on ' + country + ' country. ', 'Reload now', {duration: 3000});

        snack
            .onAction()
            .subscribe(() => {
                window.location.reload();
            });

        snack
            .afterDismissed()
            .subscribe(() => {
                window.location.reload();
            });
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action == 'language') {
            dialogRef = this.dialog.open(ModalLanguageComponent, {
            });
        }

        dialogRef.afterClosed().subscribe(result => {
            this.language = GlobalText.language;
            // console.log('The dialog was closed');
        });
    }

}
