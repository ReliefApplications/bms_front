import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { Constants } from 'src/app/models/constants/constants';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
import { PHONECODES } from 'src/app/models/constants/phone-codes';
import { CountriesService } from 'src/app/core/countries/countries.service';
import * as CountryIso from 'country-iso-3-to-2';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

    nameComponent = 'profile_title';

    actualUser: User;
    passwordForm = new FormGroup({
        email: new FormControl({ value: '', disabled: 'true' }),
        oldPassword: new FormControl(''),
        newPassword1: new FormControl(''),
        newPassword2: new FormControl('')
    });

    // Phone Stuff that will go to a modal
    phoneForm = new FormGroup({
        phonePrefix: new FormControl(''),
        phoneNumber: new FormControl('')
    });
    twoFA = false;
    loadingPhone = false;
    canTwoFA = false;

    public countryCodesList = PHONECODES;
    private getCountryISO2 = CountryIso;

    loadingPassword = false;

    // Language and country
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;
    public countryId = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');

    constructor(public userService: UserService,
        public authenticationService: AuthenticationService,
        public wsseService: WsseService,
        public snackbar: SnackbarService,
        public formBuilder: FormBuilder,
        public languageService: LanguageService,
        public router: Router,
        private asyncacheService: AsyncacheService,
        public countryService: CountriesService,
        ) {
    }

    ngOnInit() {
        this.setActualUser();
    }

    setActualUser() {
        this.authenticationService.getUser().subscribe(
            (result: User) => {
                if (result) {
                    this.actualUser = result;
                }
                if (this.actualUser) {
                    this.passwordForm.patchValue({
                        email: this.actualUser.get<string>('username')
                    });
                    this.phoneForm.patchValue({
                        phonePrefix: this.actualUser.get<string>('phonePrefix'),
                        phoneNumber: this.actualUser.get('phoneNumber')
                    });
                    this.twoFA = this.actualUser.get('twoFactorAuthentication');
                    if (this.actualUser.get<string>('phonePrefix') && this.actualUser.get('phoneNumber')) {
                        this.canTwoFA = true;
                    }
                } else {
                }
            }
        );

    }

    onPasswordSubmit(): void {
        if (this.passwordForm.value.newPassword1 !== this.passwordForm.value.newPassword2) {
            this.snackbar.error(this.language.snackbar_change_password_not_possible);
            return;
        }
        if (this.passwordForm.value.newPassword1 === this.passwordForm.value.oldPassword) {
            this.snackbar.warning(this.language.profile_password_would_not_be_changed);
            return;
        }
        if (!Constants.REGEX_PASSWORD.test(this.passwordForm.value.newPassword1)) {
            this.snackbar.error(this.language.modal_not_enough_strong);
            return;
        }
        this.loadingPassword = true;
        this.userService.updatePassword(this.actualUser, this.passwordForm.value.oldPassword, this.passwordForm.value.newPassword1)
            .then(
                () => {
                    this.loadingPassword = false;
                    this.snackbar.success(this.language.profile_password_changed);
                    this.router.navigate(['/']);
                }, err => this.loadingPassword = false);
    }

    onPhoneSubmit(): void {
        if (!this.phoneForm.value.phoneNumber) {
            this.snackbar.error(this.language.profile_phone_not_valid);
            return;
        } else {
            this.loadingPhone = true;
            this.actualUser.set('phonePrefix', this.formatPhonePrefix(this.phoneForm.value.phonePrefix, this.countryId));
            this.actualUser.set('phoneNumber', this.phoneForm.value.phoneNumber);
            this.actualUser.set('password', null);

            this.userService.update(this.actualUser.get('id'), this.actualUser.modelToApi()).subscribe((data) => {
                this.asyncacheService.setUser(data).subscribe();
                this.userService.setCurrentUser(this.actualUser);
                },
                () => {
                    this.loadingPhone = false;
                },
                () => {
                    this.loadingPhone = false;
                    this.snackbar.success(this.language.profile_phone_changed);
                    this.router.navigate(['/profile']);
                }
            );
        }
    }

    formatPhonePrefix(prefix: string, countryISO3): string {
        let phoneCode;
        if (prefix) {
            if (/([A-Z])+/.test(prefix)) {
                return this.countryCodesList.filter(element => element === prefix)[0].split('- ')[1];
            } else {
                return prefix;
            }
        } else {
            const countryCode = String(this.getCountryISO2(String(countryISO3)));
            phoneCode = this.countryCodesList.filter(element => element.split(' -')[0] === countryCode)[0].split('- ')[1];
            return phoneCode ? phoneCode : null;
        }
    }

    toogleTwoFA () {
        if (this.twoFA) {
            this.twoFA = false;
        } else {
            this.twoFA = true;
        }
        this.actualUser.set('twoFactorAuthentication', this.twoFA);
    }
}
