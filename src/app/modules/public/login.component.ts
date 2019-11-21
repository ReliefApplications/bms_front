import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
import { CustomIconService } from 'src/app/core/utils/custom-icon.service';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    public loader = false;
    public form: FormGroup;
    public formTwoFA: FormGroup;
    public loadingTwoFA = false;
    public twoFactorStep = false;

    @ViewChild('captchaRef', { static: false }) recaptcha: RecaptchaComponent;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    private subscription: Subscription = new Subscription();
    private googleProvider = new firebase.auth.GoogleAuthProvider();

    constructor(
        public authService: AuthenticationService,
        private userService: UserService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbar: SnackbarService,
        public languageService: LanguageService,
        private loginService: LoginService,
        private customIconService: CustomIconService
    ) { }

    ngOnInit() {
        this.userService.resetUser();
        this.customIconService.initializeLoginIcons();
        this.makeForm();
        this.initializeFirebase();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private makeForm() {
        this.form = new FormGroup({
            username: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required]),
        });
    }

    private initializeFirebase() {
        const firebaseConfig = {
            apiKey: 'AIzaSyBy89u6u5u17xwhHWQQJ2jhqfIkPkJUzIU',
            authDomain: 'humansis.firebaseapp.com',
            databaseURL: 'https://humansis.firebaseio.com',
            projectId: 'humansis',
            storageBucket: '',
            messagingSenderId: '592445518256',
            appId: '1:592445518256:web:79dfcb980f4b73ea'
        };

        !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

        firebase.auth().getRedirectResult().then((result: any) => {
            if (result.credential) {
                this.router.navigateByUrl('/sso?origin=google&token=' + result.credential.idToken);
            }
        }).catch((error) => {
            this.snackbar.error(error.message);
        });
    }

    public onSubmit(): void {
        const { username, password } = this.form.value;
        this.loader = true;
        this.subscription.add(this.loginService.login(username, password).pipe(
            catchError((error: any) => {
                this.loader = false;
                if (this.recaptcha) {
                    this.recaptcha.reset();
                }
                return throwError(error);
            })
        ).subscribe(
            (_success) => {
                this.loader = false;
            }
        ));
    }

    public hidAuthRedirect() {
        window.location.href = 'https://auth.staging.humanitarian.id/oauth/authorize' +
            '?response_type=code&client_id=Humsis-stag&scope=profile' +
            '&redirect_uri=https://front-test.bmstaging.info/sso?origin=hid&state=12345';
    }

    public googleAuthRedirect() {
        firebase.auth().signInWithRedirect(this.googleProvider);
    }

    prod() {
        return environment.production;
    }
}

