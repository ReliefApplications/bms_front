import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguageService } from 'src/app/core/language/language.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/core/api/user.service';
import { LoginService } from 'src/app/core/api/login.service';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public languageService: LanguageService,
        public authService: AuthenticationService,
        public route: ActivatedRoute,
        public asyncacheService: AsyncacheService,
        public userService: UserService,
        public loginService: LoginService,
        private router: Router,
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(result => {
            const origin = result['origin'];
            if (origin === 'hid') {
                this.loginHID(result['code']);
            } else if (origin === 'google') {
                this.loginGoogle(result['token']);
            }
        });
    }

    loginHID(code: string) {
        if (code) {
            this.authService.loginHumanID(code).subscribe((userFromApi: any) => {
                this.login(userFromApi);
            }, (error) => {
                this.router.navigateByUrl('/login');
            });
        }
    }

    loginGoogle(token: string) {
        this.authService.loginGoogle(token).subscribe((userFromApi: any) => {
           this.login(userFromApi);
        }, (error) => {
            this.router.navigateByUrl('/login');
        });
    }

    login(userFromApi) {
        const user = User.apiToModel(userFromApi);
        this.userService.setCurrentUser(user);
        this.asyncacheService.setUser(userFromApi).subscribe((_: any) => {
            this.loginService.clearSessionCacheEntries();
            this.loginService.loginRoutine(user).subscribe(() => {
                this.router.navigateByUrl('/');
            });
        });
    }
}
