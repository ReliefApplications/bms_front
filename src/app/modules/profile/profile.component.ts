import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/api/user.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { UserInterface, ErrorInterface } from '../../model/interfaces';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public actualUserInterface : UserInterface;

  constructor( public userService : UserService,
               public authenticationService : AuthenticationService ) {
  }

  ngOnInit() {
    this.actualUserInterface = this.authenticationService.getUser();
  }

}
