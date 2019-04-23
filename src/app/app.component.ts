import { Component, HostListener, OnInit, DoCheck } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GlobalText } from '../texts/global';
import { ModalLanguageComponent } from './components/modals/modal-language/modal-language.component';
import { AuthenticationService } from './core/authentication/authentication.service';
import { User, Role } from './model/user.new';
import { UserService } from './core/api/user.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, DoCheck {

    user: User = new User();

    public currentRoute = '';
    public currentComponent;
    public menuHover = false;
    public openTopMenu = false;
    public smallScreenMode = false;
    public maxHeight = 600;
    public maxWidth = 750;

    public isShowing = false;
    public menu = GlobalText.TEXTS;


    constructor(
        private _authenticationService: AuthenticationService,
        public router: Router,
        public dialog: MatDialog,
        public userService: UserService,
    ) { }

    ngOnInit() {
        this.checkSize();
        this._authenticationService.getUser()
            .subscribe(user => {
                this.userService.currentUser = user;
                GlobalText.changeLanguage(user.get<string>('language'));
            });
    }

    ngDoCheck() {
        if (this.menu !== GlobalText.TEXTS) {
            this.menu = GlobalText.TEXTS;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    change() {
        if (!this.smallScreenMode) {
            this.isShowing = !this.isShowing;
        }
    }

    /**LogOut
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action === 'language') {
            dialogRef = this.dialog.open(ModalLanguageComponent, {});
        }

        dialogRef.afterClosed().subscribe(result => {
        });
    }

    checkSize(): void {
        if (this.smallScreenMode === false && ((window.innerHeight < this.maxHeight) || (window.innerWidth < this.maxWidth))) {
            this.smallScreenMode = true;
            this.isShowing = true;
            GlobalText.resetMenuMargin();
        } else if (this.smallScreenMode === true && (window.innerHeight > this.maxHeight) && (window.innerWidth > this.maxWidth)) {
            this.smallScreenMode = false;
        }
        if ((window.innerHeight > this.maxHeight) && (window.innerWidth > this.maxWidth)) {
            this.isShowing = false;
        }
    }

    hoverMenu(): void {
        this.menuHover = true;
    }

    outMenu(): void {
        this.menuHover = false;
    }

    onLogOut(event: Event): void {
        this._authenticationService.logout().subscribe(
            disconnectedUser => {
                this.userService.currentUser = undefined;
                this.user = disconnectedUser;
            }
        );
    }

    clickOnTopMenu(event: Event): void {
        this.openTopMenu = !this.openTopMenu;
    }
}
