import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
import { throwError, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from 'src/app/core/api/login.service';
import { UserService } from 'src/app/core/api/user.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { environment } from 'src/environments/environment';
import { trim } from 'jquery';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    public forgotMessage = false;
    public loader = false;
    public form: FormGroup;
    public formTwoFA: FormGroup;
    public loadingTwoFA = false;
    public twoFactorStep = false;

    @ViewChild('captchaRef', { static: false }) recaptcha: RecaptchaComponent;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;
    private subscription: Subscription = new Subscription();
    constructor(
        public authService: AuthenticationService,
        private userService: UserService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbarService: SnackbarService,
        public languageService: LanguageService,
        private loginService: LoginService,
    ) { }

    ngOnInit() {
        this.userService.resetUser();
        this.makeForm();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    makeForm() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    public onSubmit(): void {
        const { username, password } = this.form.value;
        this.loader = true;
        this.subscription.add(this.loginService.login(username, password).pipe(
            catchError((error: any) => {
                this.loader = false;
                return throwError(error);
            })
        ).subscribe(
            (_success) => {
                if (_success) {
                    this.twoFactorStep = false;
                    this.loader = false;
                } else {
                    this.twoFactorStep = true;
                    this.formTwoFA = new FormGroup({
                        twoFactorCode: new FormControl('', [Validators.required]),
                    });
                }
            },
            () => {},
            () => {}
        ));
    }

    public onSubmitTwoFA(): void {
        const { twoFactorCode } = this.formTwoFA.value;
        this.loadingTwoFA = true;
        this.subscription.add(this.loginService.authenticateCode(Number(trim(twoFactorCode))).subscribe((_success) => {
            this.loadingTwoFA = false;
            if (_success) {
                this.router.navigateByUrl('/');
            } else {
                this.snackbarService.error('Invalid code. Please, try again, this time with the correct code');
            }
        }));
    }

    prod() {
        return environment.production;
    }
}

