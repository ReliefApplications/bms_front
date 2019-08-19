import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RecaptchaComponent } from 'ng-recaptcha';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginService } from 'src/app/core/api/login.service';
import { UserService } from 'src/app/core/api/user.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { environment } from 'src/environments/environment';
import * as firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';
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
    private googleProvider = new firebase.auth.GoogleAuthProvider();

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
        this.initializeFirebase();
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
        this.loginService.login(username, password).pipe(
            catchError((error: any) => {
                this.loader = false;
                return throwError(error);
            })
        ).subscribe(
            (_success) => {
                this.loader = false;
            }
        );
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
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        firebase.auth().getRedirectResult().then((result: any) => {
            if (result.credential) {
                this.router.navigateByUrl('/sso?origin=google&token=' + result.credential.idToken);
            }
        }).catch((error) => {
            this.snackbar.error(error.message);
        });
    }

    public googleAuthRedirect() {
        firebase.auth().signInWithRedirect(this.googleProvider);
    }

    // public googleAuthPopUp() {
    //     firebase.auth().signInWithPopup(this.googleProvider).then((result: any) => {
    //         this.router.navigateByUrl('/sso?origin=google&token=' + result.credential.idToken);
    //     }).catch((error) => {
    //         this.snackbar.error(error.message);
    //     });
    // }

    prod() {
        return environment.production;
    }
}

