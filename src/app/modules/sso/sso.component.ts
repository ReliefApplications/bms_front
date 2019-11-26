import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from 'src/app/core/api/login.service';
import { UserService } from 'src/app/core/api/user.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/models/user';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { OrganizationServicesService } from 'src/app/core/api/organization-services.service';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;
    public originString = 'the login page';
    public userDisabled = false;

    // Two FA variables
    public formTwoFA: FormGroup;
    public loadingTwoFA = false;
    public twoFactorStep = false;

    constructor(
        public languageService: LanguageService,
        public authService: AuthenticationService,
        public route: ActivatedRoute,
        public asyncacheService: AsyncacheService,
        public userService: UserService,
        public loginService: LoginService,
        private router: Router,
        public snackbar: SnackbarService,
        private location: Location,
        private organizationServicesService: OrganizationServicesService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(result => {
            const origin = result['origin'];

            switch (origin) {
                case 'hid':
                    this.loginHID(result['code']);
                    this.originString = 'Humanitarian ID';
                    break;
                case 'google':
                    this.loginGoogle(result['token']);
                    this.originString = 'Google';
                    break;
                default:
                    if (this.loginService.getTwoFactorStep()) {
                        this.makeForm();
                        this.twoFactorStep = true;
                    } else {
                        this.userDisabled = true;
                    }
                    break;
            }
        });
    }

    loginHID(code: string) {
        this.authService.loginHumanitarianID(code).pipe(
            switchMap((userFromApi: any) => {
                return this.loginWith2FA(userFromApi);
            })
        ).subscribe((res) => {
            if (res) {
                this.router.navigateByUrl('/');
            }
        }, (_error) => {
            this.router.navigateByUrl('/login');
        });
    }

    loginGoogle(token: string) {
        this.authService.loginGoogle(token).pipe(
            switchMap((userFromApi: any) => {
                return this.loginWith2FA(userFromApi);
            })
        ).subscribe((res) => {
            if (res) {
                this.router.navigateByUrl('/');
            }
        }, (_error) => {
            this.router.navigateByUrl('/login');
        });
    }

    loginWith2FA(userFromApi) {
        if (userFromApi && !User.apiToModel(userFromApi).get('rights')) {
            this.userDisabled = true;
            return of(null);
        } else {
            return this.organizationServicesService.get2FAToken(userFromApi).pipe(
                switchMap((token: any) => {
                    if (token && User.apiToModel(userFromApi).get('twoFactorAuthentication')) {
                        this.makeForm();
                        return this.loginService.sendCode(userFromApi, token);
                    } else {
                        return this.login(userFromApi);
                    }
                })
            );
        }
    }

    login(userFromApi) {
        const user = User.apiToModel(userFromApi);
        this.userService.setCurrentUser(user);
        return this.asyncacheService.setUser(userFromApi).pipe(
            switchMap(() => {
                this.loginService.clearSessionCacheEntries();
                return this.loginService.loginRoutine(user);
            })
        );
    }

    public makeForm() {
        this.twoFactorStep = true;
        this.formTwoFA = new FormGroup({
            twoFactorCode: new FormControl('', [Validators.required]),
        });
    }

    public onSubmitTwoFA(): void {
        const { twoFactorCode } = this.formTwoFA.value;
        this.loadingTwoFA = true;
        this.loginService.authenticateCode(Number(twoFactorCode)).subscribe((_success) => {
            this.loadingTwoFA = false;
            if (_success) {
                this.router.navigateByUrl('/');
            } else {
                this.snackbar.error(this.language.login_two_fa_invalid_code);
            }
        });
    }
}
