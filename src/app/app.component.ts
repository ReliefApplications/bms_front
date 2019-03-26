import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { GlobalText } from '../texts/global';
import { ModalLanguageComponent } from './components/modals/modal-language/modal-language.component';
import { UpdateService } from './core/api/update.service';
import { AuthenticationService } from './core/authentication/authentication.service';
import { User } from './model/user';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

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

    hasRights = false;

    constructor(
        private _authenticationService: AuthenticationService,
        private updateService: UpdateService,
        private router: Router,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.checkSize();
        this._authenticationService.getUser()
            .subscribe(user => {
                GlobalText.changeLanguage(user.language);
            });
    }

    // ngDoCheck() {
    //     if (this.menu !== GlobalText.TEXTS) {
    //         this.menu = GlobalText.TEXTS;
    //     }
    // }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    change() {
        if (!this.smallScreenMode) {
            this.isShowing = !this.isShowing;
        }
    }

    /**
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

    setCurrentRoute(currentRoute): void {
        this.currentRoute = currentRoute;
    }

    toggle(sideNavId) {
        if (this.smallScreenMode) {
            sideNavId.toggle();
        }
    }

    onLogOut(e): void {
        this._authenticationService.logout().subscribe(
            disconnectedUser => {
                this.user = disconnectedUser;
            }
        );
    }

    clickOnTopMenu(e): void {
        this.openTopMenu = !this.openTopMenu;
    }

    /**
     * get the name of the current page component (if it exists)
     * @param e
     */
    onActivate(event) {
        // Update the new component name.
        this.refreshCurrentComponent(event);
        // Verify the user.
        this._authenticationService.getUser().subscribe(
            user => {
                this.user = user;
                this.checkLoggedUser(user);
                this.checkPermission(user);
            }
        );
    }

    /**
     * Changes the name of the new component to actualize menu etc.
     */
    refreshCurrentComponent(e) {
        if (e.nameComponent === 'projects' || e.nameComponent === 'beneficiaries'
            || e.nameComponent === 'reports' || e.nameComponent === 'settings' || e.nameComponent === 'login') {
            this.currentComponent = e.nameComponent;
        } else if (e.nameComponent === 'dashboard_title') {
            this.currentComponent = null;
        } else {
            if (!this.hasRights && e.nameComponent !== 'profile_title' && e.nameComponent !== 'distributions') {
                this.router.navigate(['']);
                e.nameComponent = '';
            }

            if (e.nameComponent === 'distributions') {
                this.currentComponent = 'projects';
            }
        }

        if (!this.hasRights && e.nameComponent === 'settings') {
            this.router.navigate(['']);
            e.nameComponent = '';
        }

    }

    /**
     * Check if user is logged in and redirect if necessary.
     */
    checkLoggedUser(cachedUser) {
        if (!cachedUser.loggedIn && this.currentComponent !== 'login') {
            this.router.navigate(['/login']);
            GlobalText.resetMenuMargin();
        } else if (cachedUser.loggedIn && this.currentComponent === 'login') {
            this.router.navigate(['/']);
        }

    }

    /**
     *  Check again Permissions on each page navigation.
     * @param cachedUser
     */
    checkPermission(cachedUser) {
        if (cachedUser && cachedUser.rights) {
            const rights = cachedUser.rights;
            if (rights === 'ROLE_ADMIN' || rights === 'ROLE_PROJECT_MANAGER' || rights === 'ROLE_COUNTRY_MANAGER') {
                this.hasRights = true;
            } else {
                this.hasRights = false;
            }
        } else {
            this.hasRights = false;
        }
    }
}
