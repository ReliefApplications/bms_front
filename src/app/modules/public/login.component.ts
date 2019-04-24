import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { environment } from 'src/environments/environment';
import { LanguageService } from 'src/texts/language.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { ErrorInterface, User } from '../../model/user.new';
import { Language } from './../../../texts/language';
import { Country } from './../../model/user.new';



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

    public user: User;
    public forgotMessage = false;
    public loader = false;
    public loginCaptcha = false;
    public form: FormGroup;

    public language: Language;
    private languageSubscription: Subscription;

    constructor(
        public _authService: AuthenticationService,
        private userService: UserService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbar: SnackbarService,
        private languageService: LanguageService,
        ) { }

    ngOnInit() {
        this.languageSubscription = this.languageService.languageSource.subscribe((language: Language) => {
            this.language = language;
        });
        // TODO: enable this
        // GlobalText.resetMenuMargin();
        this.initCountry('KHM');
        this.blankUser();
        this.makeForm();
    }

    ngOnDestroy(): void {
        this.languageSubscription.unsubscribe();
    }

    initCountry(country: string) {
        this.asyncacheService.get(AsyncacheService.COUNTRY).subscribe(
            (result: any) => {
                if (!result) {
                    this.asyncacheService.set(AsyncacheService.COUNTRY, country);
                }
            }
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
            this.snackbar.error(this.language.login_captcha_invalid);
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
                    user.get('rights').get<string>('id') === 'ROLE_ADMIN') {
                    this.initCountry('KHM');
                } else {
                    this.initCountry(user.get<Array<Country>>('countries')[0].get<string>('name'));
                }
                this.router.navigate(['/']);
                if (user.get<string>('language')) {
                    this.languageService.changeLanguage(this.languageService.stringToLanguage(user.get<string>('language')));
                } else {
                    this.languageService.changeLanguage(this.languageService.stringToLanguage('en'));
                }

                this.loader = false;
            },
            (error: ErrorInterface) => {
                this.forgotMessage = true;
                this.loader = false;
            });
    }

    onScriptError() {
        this.snackbar.error(this.language.login_captcha_invalid);
    }

    prod() {
        return environment.production;
    }
}

