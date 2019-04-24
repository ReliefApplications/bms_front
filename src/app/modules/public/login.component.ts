import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { environment } from 'src/environments/environment';
import { GlobalText } from '../../../texts/global';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { ErrorInterface, User } from '../../model/user.new';
import { Country } from './../../model/user.new';
import { map } from 'rxjs/operators';



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public nameComponent = GlobalText.TEXTS.login_title;
    public login = GlobalText.TEXTS;

    public user: User;
    public forgotMessage = false;
    public loader = false;
    public loginCaptcha = false;
    public form: FormGroup;

    constructor(
        public _authService: AuthenticationService,
        private userService: UserService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbar: SnackbarService,
    ) { }

    ngOnInit() {
        GlobalText.resetMenuMargin();
        this.blankUser();
        this.makeForm();
    }

    initCountry(country: string, getFromCache: boolean) {
        return this.asyncacheService.get(AsyncacheService.COUNTRY).pipe(
            map((result: any) => {
                if (!result || !getFromCache) {
                    this.asyncacheService.set(AsyncacheService.COUNTRY, country);
                }
            })
        );
    }

    /**
     * Reset the user to empty.
     */
    blankUser() {
        this.user = new User();
        this.user.set('username', '');
        this.user.set('password', '');
        this.userService.currentUser = this.user;
    }

    makeForm = () => {
        this.form = new FormGroup( {
            username  : new FormControl(this.user.get<string>('username'), [Validators.required]),
            password : new FormControl(this.user.get<string>('password'), [Validators.required]),
        });

        if (this.prod()) {
            this.form.addControl(
                'captcha', new FormControl(this.loginCaptcha, [Validators.required]),
            );
        }
    }

    onSubmit = () => {
        this.user.set('email', this.form.controls['username'].value);
        this.user.set('password', this.form.controls['password'].value);
        // Prevent captcha bypass by setting button to enabled in production mode
        if (this.prod() && !this.form.controls['captcha'].value) {
            this.snackbar.error(GlobalText.TEXTS.login_captcha_invalid);
            return;
        }
        this.loginAction();
    }


    /**
     * When the user hits login
     */
    private loginAction(): void {
        this.loader = true;
        const subscription = from(this._authService.login(this.user));
        subscription.subscribe(
            (user: User) => {
                this.userService.currentUser = user;
                if (user.get('countries') &&
                    user.get<Array<Country>>('countries').length === 0 &&
                    this.userService.hasRights('ROLE_SWITCH_COUNTRY')) {
                    this.initCountry('KHM', true).subscribe(success => {
                        this.goToHomePage(user);
                    });
                } else {
                    this.initCountry(user.get<Array<Country>>('countries')[0].get<string>('id'), false).subscribe(success => {
                        this.goToHomePage(user);
                    });
                }
                this.loader = false;
            },
            (error: ErrorInterface) => {
                this.forgotMessage = true;
                this.loader = false;
            });
    }

    goToHomePage(user: User) {
        if (user.get<string>('language')) {
            GlobalText.changeLanguage(user.get<string>('language'));
        } else {
            GlobalText.changeLanguage();
        }
        this.router.navigate(['/']);
    }

    onScriptError() {
        this.snackbar.error(GlobalText.TEXTS.login_captcha_invalid);
    }

    prod() {
        return environment.production;
    }
}

