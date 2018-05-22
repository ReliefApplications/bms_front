import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../core/authentication/authentication.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	username: string;
	password: string;

	constructor(
		public _authService: AuthenticationService,
		public router: Router
	) { }

	ngOnInit() {
	}

	login() {
		this._authService.login(this.username, this.password);
		this.router.navigate(['/']);
	}

}
