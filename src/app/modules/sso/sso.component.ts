import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { throwError, Observable } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language/language.service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/models/user';
import { FormService } from 'src/app/core/utils/form.service';
import { UserService } from 'src/app/core/api/user.service';
import { LoginService } from 'src/app/core/api/login.service';

@Component({
    selector: 'app-sso',
    templateUrl: './sso.component.html',
    styleUrls: ['./sso.component.scss']
})
export class SsoComponent implements OnInit {

    public forgotMessage = false;
    public loader = false;
    public form: FormGroup;
    public mode: string;
    public user: User;
    public objectFields = [];

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        public languageService: LanguageService,
        public authService: AuthenticationService,
        public route: ActivatedRoute,
        public asyncacheService: AsyncacheService,
        public formService: FormService,
        public userService: UserService,
        public loginService: LoginService,
        private router: Router,
    ) { }

    ngOnInit() {
        // this.asyncacheService.getUser().subscribe((user: User) => {
        //     this.mode = user ? 'create' : 'login';
        //     if (this.mode === 'create') {
        //         this.user = new User();
        //         this.userService.fillWithOptions(this.user);
        //         this.objectFields = ['rights', 'projects', 'countries'];
        //         this.form = this.formService.makeForm(this.user, this.objectFields, 'Add');
        //         this.onChanges();
        //     }
        // });
    }

    // createHumanId() {
    //     this.loader = true;
    //     for (const fieldName of this.objectFields) {
    //         const field = this.user.fields[fieldName];

    //         if (field.kindOfField === 'MultipleSelect') {
    //             this.user.set(fieldName, []);
    //             if (this.form.controls[fieldName].value) {
    //                 this.form.controls[fieldName].value.forEach(optionId => {
    //                     const selectedOption = this.user.getOptions(fieldName).filter(option => {
    //                         return option.get('id') === optionId;
    //                     })[0];
    //                     this.user.add(fieldName, selectedOption);
    //                 });
    //             }
    //         } else if (this.form.controls[fieldName].value && field.kindOfField === 'SingleSelect') {
    //             this.user.set(fieldName, this.user.getOptions(fieldName).filter(option => {
    //                 return option.get('id') === this.form.controls[fieldName].value;
    //             })[0]);
    //         }
    //     }
    //     this.route.fragment.subscribe(result => {
    //         const accessToken = result.match(/access_token=([a-z\d]+)/);
    //         if (accessToken) {
    //             this.authService.createHumanID(accessToken[1], this.user.modelToApi()).subscribe((_user) => {
    //                 this.loader = false;
    //             }, (_error) => {
    //                 this.loader = false;
    //             });
    //         }
    //     });
    // }

    // // TODO : Used in two places (modal fields too), refactor it
    // onChanges(): void {
    //     const triggeringFieldsNames = this.objectFields.filter((fieldName) => this.user.fields[fieldName].isTrigger === true);
    //     triggeringFieldsNames.forEach((fieldName) => {
    //         this.form.get(fieldName).valueChanges.subscribe(value => {
    //             this.user = this.user.fields[fieldName].triggerFunction(this.user, value, this.form);
    //         });
    //     });
    //     const multipleSelects = this.objectFields.filter((fieldName) => {
    //         return this.user.fields[fieldName].kindOfField === 'MultipleSelect';
    //     });
    //     multipleSelects.forEach((fieldName) => {
    //         this.form.get(fieldName).valueChanges.subscribe(value => {
    //             if (this.user.fields[fieldName].maxSelectionLength &&
    //                 value.length > this.user.fields[fieldName].maxSelectionLength) {
    //                 value.shift();
    //                 this.form.controls[fieldName].setValue(value);
    //             }
    //         });
    //     });
    // }

    loginHumanId() {
        this.loader = true;
        this.route.fragment.subscribe(result => {
            const accessToken = result.match(/access_token=([a-z\d]+)/);
            if (accessToken) {
                this.authService.loginHumanID(accessToken[1]).subscribe((userFromApi: any) => {
                    const user = User.apiToModel(userFromApi);
                    this.userService.setCurrentUser(user);
                    this.asyncacheService.setUser(userFromApi).subscribe((_: any) => {
                        this.loginService.clearSessionCacheEntries();
                        this.loginService.loginRoutine(user).subscribe(() => {
                            this.router.navigateByUrl('/');
                        });
                    });
                });
            }
        });
    }
}
