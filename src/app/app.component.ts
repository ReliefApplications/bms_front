import { Component, HostListener } from '@angular/core';
import { User } from './model/user';
import { AuthenticationService } from './core/authentication/authentication.service';
import { GlobalText } from '../texts/global';

import { ModalLanguageComponent } from './components/modals/modal-language/modal-language.component';
import { MatDialog, MatSidenav } from '@angular/material';
import { AsyncacheService } from './core/storage/asyncache.service';
import { interval, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    user: User = new User();
    public currentRoute = "";
    public currentComponent;
    public menuHover = false;
    public logOut = true;
    public openTopMenu = false;
    public smallScreenMode;
    public maxHeight = 600;
    public maxWidth = 750;

    public isShowing = false;
    public menu = GlobalText.TEXTS;

    hasRights: boolean = false;

    constructor(
        private _authenticationService: AuthenticationService,
        private _cacheService: AsyncacheService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.checkSize();
        this.getUser();

        timer(0, 1000).pipe(
            map(
                () => {
                    this.checkPermission();
                }
            )
        ).subscribe();
    }


    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    change() {
        if (!this.smallScreenMode)
            this.isShowing = !this.isShowing;
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action == 'language') {
            dialogRef = this.dialog.open(ModalLanguageComponent, {
            });
        }

        dialogRef.afterClosed().subscribe(result => {
            // console.log('The dialog was closed');
        });
    }

    checkSize(): void {
        if ((window.innerHeight < this.maxHeight) || (window.innerWidth < this.maxWidth)) {
            this.smallScreenMode = true;
            this.isShowing = true;
        }
        else {
            this.smallScreenMode = false;
            this.isShowing = false;
        }
    }

    getUser(): User {
        this._authenticationService.getUser().subscribe(
            result => {
                if (this.user.id) {
                    if (!this.user.loggedIn) {
                        this.logOut = true;
                    } else {
                        this.logOut = false;
                    }
                }
                this.user = result;
                if (!this.user.loggedIn) {
                    this.logOut = true;
                } else {
                    this.logOut = false;
                }
            }
        );
        return this.user;
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
        this.user.loggedIn = false;
        this._authenticationService.logout();
        this.getUser();
    }

    ngDoCheck(): void {
        if (this.logOut) {
            this.getUser();
        }
    }

    clickOnTopMenu(e): void {
        this.openTopMenu = !this.openTopMenu;
    }

    /**
     * get the name of the current page component (if it exists)
     * @param e
     */
    onActivate(e) {
        if (!e.nameComponent || e.nameComponent === 'project_title' || e.nameComponent === 'beneficiaries_title'
            || e.nameComponent === 'report_title' || e.nameComponent === 'settings_title') {
            this.currentComponent = e.nameComponent;
        }
    }

    checkPermission() {
        this._cacheService.getUser().subscribe(
            result => {
                console.log('trter', result.voters);
                if(result && result.voters) {
                    const voters = result.voters;
                    if (voters == "ROLE_ADMIN" || voters == 'ROLE_PROJECT_MANAGER' || voters == "ROLE_COUNTRY_MANAGER")
                        this.hasRights = true;
                    else
                        this.hasRights = false;
                } else {
                    this.hasRights = false;
                }
            }
        )
        
    }
}
