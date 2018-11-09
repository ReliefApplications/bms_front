import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material';

import { GlobalText } from '../../../../texts/global';

import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    public header = GlobalText.TEXTS;
    public language = "en";

    @Output() emitLogOut = new EventEmitter();

    public currentRoute = "/";
    public breadcrumb: Array<any> = [{
        'route': "/",
        'name': this.header.header_home
    }];

    constructor(
        public dialog: MatDialog,
        public router: Router
    ) {
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentRoute = event.url;
                if (this.currentRoute.indexOf("?") > -1) {
                    this.currentRoute = this.currentRoute.substring(0, this.currentRoute.indexOf('?'));
                }
                this.updateBreadcrumb();

            }
        })
    }

    ngOnInit() {
        this.language = GlobalText.language;
    }

    /**
     * Update the breadcrumb according to the current route
     */
    updateBreadcrumb() {
        let parsedRoute = this.currentRoute.split('/');

        this.breadcrumb = [{
            'route': "/",
            'name': this.header.header_home
        }];

        parsedRoute.forEach((item, index) => {
            if (index > 0 && item !== "") {
                if (isNaN(+item)) {
                    let breadcrumbItem = {
                        'route': this.breadcrumb[index - 1].route + (index === 1 ? "" : "/") + item,
                        'name': this.header["header_" + item]
                    }
                    this.breadcrumb.push(breadcrumbItem);
                } else {
                    let length = this.breadcrumb.length;
                    this.breadcrumb[length - 1].route = this.breadcrumb[length - 1].route + "/" + item;
                }
            }
        });
    }

    logOut(): void {
        this.emitLogOut.emit();
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
            this.language = GlobalText.language;
        });
    }
}
