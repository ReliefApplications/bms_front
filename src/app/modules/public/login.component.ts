import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
import { map } from 'rxjs/operators';
import { LoginService } from 'src/app/core/api/login.service';
import { UserService } from 'src/app/core/api/user.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public forgotMessage = false;
    public loader = false;
    public form: FormGroup;

    @ViewChild('captchaRef') recaptcha: RecaptchaComponent;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public authService: AuthenticationService,
        private userService: UserService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbar: SnackbarService,
        public languageService: LanguageService,
        private loginService: LoginService,
    ) { }

    ngOnInit() {
        this.userService.resetUser();
        this.makeForm();
    }

    initCountry(country: string, getFromCache: boolean) {
        return this.asyncacheService.get(AsyncacheService.COUNTRY).pipe(
            map((result: any) => {
                if (!result || !getFromCache) {
                    this.asyncacheService.set(AsyncacheService.COUNTRY, country).subscribe();
                }
            })
        );
    }

    makeForm() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    /**
     * When the user hits login
     */
    public onSubmit(): void {
        const {username, password} = this.form.value;
            this.loginService.login(username, password).subscribe();
        // this.loader = true;
        // const subscription = from(this._authService.login(
        //     this.form.controls['username'].value,
        //     this.form.controls['password'].value
        // ));
        // subscription.subscribe(
        //     (user: User) => {
        //         if (user) {
        //             this.userService.setCurrentUser(user);
        //             this.userService.setUserCountry(user);
        //             if ((! user.get<Array<Country>>('countries') ||
        //                 user.get<Array<Country>>('countries').length === 0) &&
        //                 this.userService.hasRights('ROLE_SWITCH_COUNTRY')) {
        //                 this.initCountry('KHM', true).subscribe((_success: any) => {
        //                     this.redirectAfterLogin(user);
        //                 });
        //             } else {
        //                 this.initCountry(user.get<Array<Country>>('countries')[0].get<string>('id'), false).subscribe((_success: any) => {
        //                     this.redirectAfterLogin(user);
        //                 });
        //             }

        //             if (user.get<string>('language')) {
        //                 this.languageService.selectedLanguage = this.languageService.setLanguage(
        //                     this.languageService.stringToLanguage(user.get<string>('language'))
        //                     );
        //             } else {
        //                 this.languageService.selectedLanguage = this.languageService.setLanguage(this.languageService.english);
        //             }
        //         }

        //         this.loader = false;
        //     },
        //     (_error: ErrorInterface) => {
        //         if (this.recaptcha) {
        //             this.recaptcha.reset();
        //         }
        //         this.loader = false;
        //         this.forgotMessage = true;
        //     });
    }

    prod() {
        return environment.production;
    }
}

