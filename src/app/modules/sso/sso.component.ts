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
            const code = result['code'];
            if (code) {
                this.authService.loginHumanID(code).subscribe((userFromApi: any) => {
                    const user = User.apiToModel(userFromApi);
                    this.userService.setCurrentUser(user);
                    this.asyncacheService.setUser(userFromApi).subscribe((_: any) => {
                        this.loginService.clearSessionCacheEntries();
                        this.loginService.loginRoutine(user).subscribe(() => {
                            this.router.navigateByUrl('/');
                        });
                    });
                }, (error) => {
                    this.router.navigateByUrl('/login');
                });
            }
        });
    }
}
