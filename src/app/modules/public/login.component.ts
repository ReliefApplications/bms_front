import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { Country } from 'src/app/model/country';
import { environment } from 'src/environments/environment';
import { LanguageService } from 'src/texts/language.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { ErrorInterface, User } from '../../model/user.new';



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public forgotMessage = false;
    public loader = false;
    public loginCaptcha = false;
    public form: FormGroup;
    // Language
    public language = this.languageService.selectedLanguage;


    constructor(
        public _authService: AuthenticationService,
        private userService: UserService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbar: SnackbarService,
        private languageService: LanguageService,
        ) { }

    ngOnInit() {
        // TODO: enable this
        // GlobalText.resetMenuMargin();
        this.userService.resetCacheUser();
        // this.asyncacheService.reset;
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

    makeForm() {

        this.form = new FormGroup( {
            username  : new FormControl('', [Validators.required]),
            password : new FormControl('', [Validators.required]),
        });

        if (this.prod()) {
            this.form.addControl(
                'captcha', new FormControl(this.loginCaptcha, [Validators.required]),
            );
        }
    }

    onSubmit() {
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
        const subscription = from(this._authService.login(
            this.form.controls['username'].value,
            this.form.controls['password'].value
        ));
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
                this.router.navigate(['/']);
                if (user.get<string>('language')) {
                    this.languageService.selectedLanguage = this.languageService.stringToLanguage(user.get<string>('language'));
                } else {
                    this.languageService.selectedLanguage = this.languageService.stringToLanguage('en');
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
            this.languageService.selectedLanguage = this.languageService.stringToLanguage(user.get<string>('language'));
        } else {
            // TODO: load default language
            this.languageService.selectedLanguage = this.languageService.enabledLanguages[0];

        }
        this.router.navigate(['/']);
    }

    onScriptError() {
        this.snackbar.error(this.language.login_captcha_invalid);
    }

    prod() {
        return environment.production;
    }
}

