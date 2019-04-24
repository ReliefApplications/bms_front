import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { User, Country } from 'src/app/model/user.new';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NavigationEnd, Router } from '@angular/router';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { GlobalText } from '../../../../texts/global';
import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';
import { UserService } from './../../../core/api/user.service';
import { HeaderComponent } from '../header/header.component';



@Component({
    selector: 'app-header-mobile',
    templateUrl: './header-mobile.component.html',
    styleUrls: [ './header-mobile.component.scss' ]
})
export class HeaderMobileComponent extends HeaderComponent implements OnInit, DoCheck {

    @Output() emitCurrentRoute = new EventEmitter<string>();
    @Output() emitToggle = new EventEmitter();

    ngOnInit() {
        this.language = GlobalText.language;
        this.getCorrectCountries();
        this.updateTooltip();
    }

    ngDoCheck() {
        if (this.header !== GlobalText.TEXTS) {
            this.header = GlobalText.TEXTS;
            this.updateBreadcrumb();
            this.updateTooltip();
        }

        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    toggle() {
        this.emitToggle.emit();
    }
}
