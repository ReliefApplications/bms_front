import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { GlobalText } from '../../../../texts/global';
import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';



@Component({
    selector: 'app-header-mobile',
    templateUrl: './header-mobile.component.html',
    styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent implements OnInit, DoCheck {
    public header = GlobalText.TEXTS;
    public language = 'en';

    private requesting = false;
    public countries = [ ];
    public selectedCountry: string;

    @Output() emitLogOut = new EventEmitter();
    @Output() emitCurrentRoute = new EventEmitter<string>();
    @Output() emitToggle = new EventEmitter();
    @Input() userData: User;

    constructor(
        public dialog: MatDialog,
        private userService: UserService,
        private asyncacheService: AsyncacheService,
        private snackbar: SnackbarService,
    ) { }

    ngOnInit() {
        this.language = GlobalText.language;
        this.userData = new User(this.userData);
        this.getCorrectCountries();
    }

    logOut(): void {
        this.emitLogOut.emit();
    }

    ngDoCheck() {
        if (this.header !== GlobalText.TEXTS) {
            this.header = GlobalText.TEXTS;
        }

        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    setCurrentRoute(route: string) {
        this.emitCurrentRoute.emit(route);
    }

    toggle() {
        this.emitToggle.emit();
    }

    getCorrectCountries() {
        let user = this.userService.currentUser;
        this.countries = [];
        if (!user) {
            user = this.userData;
        }
        if (this.userService.hasRights('ROLE_SWITCH_COUNTRY')) {
            this.userService.currentUser.getAllCountries().forEach((country: object[]) => {
                this.countries.push(country['id']);
            });
        }

        this.asyncacheService.get(AsyncacheService.COUNTRY).subscribe(
            result => {
                if (result) {
                    this.selectCountry(result);
                } else {
                    this.selectCountry(this.countries[0]);
                }
            }
        );
    }

    selectCountry(c: string) {
        if (c) {
            if (!this.selectedCountry || !GlobalText.country) {
                this.autoLanguage(c);
            } else if (GlobalText.country && this.selectedCountry && c !== this.selectedCountry) {
                this.preventSnack(c);
            }

            this.selectedCountry = c;
            GlobalText.country = c;
            this.asyncacheService.set(AsyncacheService.COUNTRY, this.selectedCountry);
        }
    }

    autoLanguage(c: string) {
        if (this.userData.language) {
            GlobalText.changeLanguage(this.userData.language);
        } else {
            if (c === 'SYR') {
                GlobalText.changeLanguage('ar');
            } else if (c === 'KHM') {
                GlobalText.changeLanguage('en');
            }
        }

    }

    preventSnack(country: string) {
        const snack = this.snackbar.info('Page is going to reload in 3 sec to switch on ' + country + ' country. ', 'Reload');

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

        if (user_action === 'language') {
            dialogRef = this.dialog.open(ModalLanguageComponent, {});
        }

        dialogRef.afterClosed().subscribe(result => {
            this.language = GlobalText.language;
        });
    }

}
