import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UserInterface, ErrorInterface } from '../../model/interfaces';

import { GlobalText } from '../../../texts/global';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
	public nameComponent = GlobalText.TEXTS.login_title;
	public login = GlobalText.TEXTS;

	public user: UserInterface;
	public forgotMessage: boolean = false;

	constructor(
		public _authService: AuthenticationService,
		public router: Router
	) { }

	ngOnInit() {
		this.user = this._authService.getUser();
		this.user.username = "tester";
		this.user.password = "tester";
		if (this.user.loggedIn) {
			this.router.navigate(['/']);
		}
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
			.then((user: UserInterface) => {
				if (user.loggedIn) {
					//redirect
					this.router.navigate(['/']);
				}
			})
			.catch((error: ErrorInterface) => {
				console.log(error);
				this.forgotMessage = true;
			});
	}

}
