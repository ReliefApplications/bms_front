import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserService } from 'src/app/core/api/user.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { User } from 'src/app/model/user';
import { GlobalText } from '../../../../texts/global';
import { ModalLanguageComponent } from '../../../components/modals/modal-language/modal-language.component';
import { HeaderComponent } from '../header/header.component';



@Component({
    selector: 'app-header-mobile',
    templateUrl: './header-mobile.component.html',
    styleUrls: ['./header-mobile.component.scss']
})
export class HeaderMobileComponent extends HeaderComponent implements OnInit, DoCheck {

    @Output() emitCurrentRoute = new EventEmitter<string>();
    @Output() emitToggle = new EventEmitter();

    ngOnInit() {
        this.language = GlobalText.language;
        this.getCorrectCountries();
    }

    ngDoCheck() {
        if (this.header !== GlobalText.TEXTS) {
            this.header = GlobalText.TEXTS;
        }

        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    toggle() {
        this.emitToggle.emit();
    }
}
