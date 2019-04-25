import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HeaderComponent } from '../header/header.component';



@Component({
    selector: 'app-header-mobile',
    templateUrl: './header-mobile.component.html',
    styleUrls: [ './header-mobile.component.scss' ]
})
export class HeaderMobileComponent extends HeaderComponent implements OnInit {

    @Output() emitCurrentRoute = new EventEmitter<string>();
    @Output() emitToggle = new EventEmitter();

    ngOnInit() {
        this.getCorrectCountries();
        this.updateTooltip();
    }

    toggle() {
        this.emitToggle.emit();
    }
}
