import { Component, DoCheck, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { environment } from 'src/environments/environment';
import { GlobalText } from '../../../texts/global';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { ErrorInterface, User } from '../../model/user';



@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, DoCheck {

    public nameComponent = GlobalText.TEXTS.login_title;
    public login = GlobalText.TEXTS;

    public user: User;
    public forgotMessage = false;
    public loader = false;
    public loginCaptcha = false;
    public form: FormGroup;

    constructor(
        public _authService: AuthenticationService,
        public asyncacheService: AsyncacheService,
        public router: Router,
        public snackbar: SnackbarService,
    ) { }

    ngOnInit() {
        GlobalText.resetMenuMargin();
        this.initCountry('KHM');
        this.blankUser();
        this.makeForm();
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
        this.user.username = '';
        this.user.password = '';
    }

    makeForm = () => {
        this.form = new FormGroup( {
            username  : new FormControl(this.user.username, [Validators.required]),
            password : new FormControl(this.user.password, [Validators.required]),
        });

        if (this.prod()) {
            this.form.addControl(
                'captcha', new FormControl(this.loginCaptcha, [Validators.required]),
            );
        }
    }

    onSubmit = () => {
        this.user.username = this.form.controls['username'].value;
        this.user.password = this.form.controls['password'].value;
        this.loginAction();
    }
    /**
   	* check if the langage has changed
   	*/
    ngDoCheck() {
        if (this.login !== GlobalText.TEXTS) {
            this.login = GlobalText.TEXTS;
        }
        // tslint:disable-next-line
        console.log(this.form.controls['captcha'].value);

    }


    /**
     * When the user hits login
     */
    private loginAction(): void {
        this.loader = true;
        const subscription = from(this._authService.login(this.user));
        subscription.subscribe(
            (user: User) => {
                if (user.country && user.country.length === 0 && user.rights === 'ROLE_ADMIN') {
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
        this.snackbar.error('Captcha failed');
    }

    prod() {
        return environment.production;
    }
}
