import { Component, OnInit, DoCheck } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { User, ErrorInterface } from '../../model/user';
import { GlobalText } from '../../../texts/global';
import { WsseService } from '../../core/authentication/wsse.service';
import { SaltInterface } from '../../model/salt';
import { MatSnackBar } from '@angular/material';

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
        public snackBar: MatSnackBar,
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
                if(this.actualUser) {
                    this.profileForm.patchValue({
                        email: this.actualUser.username
                    });
                } else {
                }
            }
        );

    }

    onProfileFormSubmit() {

        if (this.profileForm.value.newPassword1.length > 1 &&
            this.profileForm.value.newPassword1 == this.profileForm.value.newPassword2) {
            this.userService.updatePassword(this.actualUser, this.profileForm.value.oldPassword, this.profileForm.value.newPassword1)
                .then((user: User) => {
                    //console.log(user)
                    // SNACKBAR
                    this.snackBar.open(this.profilePage.snackbar_change_password_done, '', { duration: 3000, horizontalPosition: 'center' });
                })
                .catch((error: ErrorInterface) => {
                    //console.log(error);
                    // SNACKBAR
                    this.snackBar.open(this.profilePage.snackbar_change_password_fail, '', { duration: 3000, horizontalPosition: 'center' });
                });
        }
        else {
            this.snackBar.open(this.profilePage.snackbar_change_password_not_possible, '', { duration: 3000, horizontalPosition: 'center' });
        }

        this.setActualUser();
    }

}
