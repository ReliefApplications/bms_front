import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UserInterface, ErrorInterface } from '../../model/interfaces';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

	public user:UserInterface;
	public forgotMessage :boolean = false;

	constructor(
		public _authService: AuthenticationService,
		public router: Router
	) { }

	ngOnInit() {
		this.user = this._authService.getUser();
        this.user.username = "tester";
        this.user.password = "tester";
        if(this.user.loggedIn){
            this.router.navigate(['/']);
        }
	}

	login() {
		this._authService.login(this.user)
		  .then( (user:UserInterface) => {
			  if( user.loggedIn ){
				  //redirect
				  this.router.navigate(['/']);
			  }
		  })
		  .catch( (error:ErrorInterface) => {
			  this.forgotMessage = true;
		  });
	}

}
