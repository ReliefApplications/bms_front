import { Component, DoCheck, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { GlobalText } from '../../../texts/global';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { WsseService } from '../../core/authentication/wsse.service';
import { User } from '../../model/user.new';
import { ErrorInterface } from './../../model/user.new';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit, DoCheck {

    profilePage = GlobalText.TEXTS;
    nameComponent = 'profile_title';

    actualUser: User;
    profileForm = new FormGroup({
        email: new FormControl({ value: '', disabled: 'true' }),
        oldPassword: new FormControl(''),
        newPassword1: new FormControl(''),
        newPassword2: new FormControl('')
    });

    constructor(public userService: UserService,
        public authenticationService: AuthenticationService,
        public wsseService: WsseService,
        public snackbar: SnackbarService,
        public formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.setActualUser();
    }

    ngDoCheck() {
        if (this.profilePage !== GlobalText.TEXTS) {
            this.profilePage = GlobalText.TEXTS;
        }
    }

    setActualUser() {
        this.authenticationService.getUser().subscribe(
            result => {
                this.actualUser = result;
                if (this.actualUser) {
                    this.profileForm.patchValue({
                        email: this.actualUser.get<string>('username')
                    });
                } else {
                }
            }
        );

    }

    onProfileFormSubmit() {
        const checkPass = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);
        if (this.profileForm.value.newPassword1 === this.profileForm.value.newPassword2) {
            if (checkPass.test(this.profileForm.value.newPassword1)) {
                this.userService.updatePassword(this.actualUser, this.profileForm.value.oldPassword, this.profileForm.value.newPassword1)
                    .then(
                        (user) => {
                            this.snackbar.success(this.profilePage.snackbar_change_password_done);
                        })
                    .catch((error: ErrorInterface) => {
                        this.snackbar.error(this.profilePage.snackbar_change_password_fail);
                    });
            } else {
                this.snackbar.error(this.profilePage.modal_not_enough_strong);
            }
        } else {
            this.snackbar.error(this.profilePage.snackbar_change_password_not_possible);
        }

        this.setActualUser();
    }
}
