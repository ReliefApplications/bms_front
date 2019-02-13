import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { User, ErrorInterface } from '../../model/user';

import { GlobalText } from '../../../texts/global';
import { MatSnackBar } from '@angular/material';
import { Subscription, from, of } from 'rxjs';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public nameComponent = GlobalText.TEXTS.login_title;
    public login = GlobalText.TEXTS;
    private authUser$: Subscription;

    public user: User;
    public forgotMessage: boolean = false;
    public loader: boolean = false;
    public loginCaptcha = false;

    constructor(
        public _authService: AuthenticationService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        GlobalText.resetMenuMargin();
        this.initCountry('KHM');
        this.blankUser();
    }

    initCountry(country: string) {
        this.asyncacheService.get(AsyncacheService.COUNTRY).subscribe(
            result => {
                if(!result) {
                    this.asyncacheService.set(AsyncacheService.COUNTRY, country);
                }
            }
        )
    }

    /**
     * Reset the user to empty.
     */
    blankUser() {
        this.user = new User();
        this.user.username = '';
        this.user.password = '';
    }

	/**
   	* check if the langage has changed
   	*/
    ngDoCheck() {
        if (this.login != GlobalText.TEXTS) {
            this.login = GlobalText.TEXTS;
        }
    }

    /**
     * When the user hits login
     */
    loginAction(): void {
        this.loader = true;
        const subscription = from(this._authService.login(this.user));
        subscription.subscribe(
            (user: User) => {
                if (user.country && user.country.length === 0 && user.rights === "ROLE_ADMIN") {
                  this.initCountry('KHM');
                } else {
                    this.initCountry(user.country[0]);
                }
                this.router.navigate(['/']);
                if (user.language) {
                    GlobalText.changeLanguage(user.language);
                } else {
                    GlobalText.changeLanguage();
                }

                this.loader = false;
            },
            (error: ErrorInterface) => {
                this.forgotMessage = true;
                this.loader = false;
            });
    }

    onScriptError() {
        this.snackBar.open('Captcha failed', '', { duration: 5000, horizontalPosition: "center" });
    }

    prod() {
        return environment.production;
    }
}
