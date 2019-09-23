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

    loadingPassword = false;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(public userService: UserService,
        public authenticationService: AuthenticationService,
        public wsseService: WsseService,
        public snackbar: SnackbarService,
        public formBuilder: FormBuilder,
        public languageService: LanguageService,
        public router: Router,
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
        // TODO: check form is correct
        this.loadingPhone = true;
        this.actualUser.set('phonePrefix', this.phoneForm.value.phonePrefix);
        this.actualUser.set('phoneNumber', this.phoneForm.value.phoneNumber);
        this.actualUser.set('password', null);

        this.userService.update(this.actualUser.get('id'), this.actualUser.modelToApi()).subscribe((data) => {
            },
            () => this.loadingPhone = false,
            () => {this.loadingPhone = false;
                this.snackbar.success('OLE NIÑO OLE');
                this.router.navigate(['/profile']);
            }
        );

        // this.actualUser.set('phonePrefix', this.phoneForm.value.phonePrefix);
        // this.actualUser.set('phoneNumber', this.phoneForm.value.phoneNumber);
        // this.userService.updatePhone(this.actualUser, this.phoneForm.value.phonePrefix, this.phoneForm.value.phoneNumber)
        // .then(
        //     () => {
        //         this.loadingPhone = false;
        //         this.snackbar.success('OLE NIÑO OLE');
        //         this.router.navigate(['/profile']);
        //     }, err => this.loadingPhone = false);
    }

    toogleTwoFA () {
        if (this.twoFA) {
            this.twoFA = false;
            this.actualUser.set('twoFactorAuthentication', false);
            // TODO: Disable user 2FA. Update DB
        } else {
            if (this.actualUser.get('phonePrefix') || this.actualUser.get('phonePrefix')) {
                this.twoFA = true;
                this.actualUser.set('twoFactorAuthentication', true);
                // TODO: Set user 2FA phone (modal?). Update DB
            }
        }
    }
}
