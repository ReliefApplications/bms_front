import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { User, ErrorInterface } from '../../model/user';

import { GlobalText } from '../../../texts/global';
import { MatSnackBar } from '@angular/material';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	public nameComponent = GlobalText.TEXTS.login_title;
	public login = GlobalText.TEXTS;

	public user: User;
	public forgotMessage: boolean = false;

	constructor(
		public _authService: AuthenticationService,
		public router: Router,
		public snackBar: MatSnackBar
	) { }

	ngOnInit() {
		this._authService.getUser().subscribe(
            result => {
                this.user = result;
                if(this.user) {
                    this.user.username = "tester";
                    this.user.password = "tester";
                    if (this.user.loggedIn) {
                        this.router.navigate(['/']);
                    }
                    console.log('initialised user --', this.user);
                }
            },
            error => {
                this.user = null;
            }
        );
	}

	/**
   	* check if the langage has changed
   	*/
	ngDoCheck() {
		if (this.login != GlobalText.TEXTS) {
			this.login = GlobalText.TEXTS;
		}
	}

	loginAction(): void {
		this._authService.login(this.user)
			.then((user: User) => {
				if (user.loggedIn) {
					//redirect
					this.router.navigate(['/']);
				}
			})
			.catch((error: ErrorInterface) => {
				this.snackBar.open(error.message, '', { duration: 3000, horizontalPosition: "center" });
				this.forgotMessage = true;
			});
	}

}
