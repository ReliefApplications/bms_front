import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-box-setting',
    templateUrl: './box-setting.component.html',
    styleUrls: ['./box-setting.component.scss']
})
export class BoxSettingComponent implements OnInit {
    @Input() selectedTitle;
    @Input() info: any;
    @Output() emitClickedTitle = new EventEmitter<string>();

    readonly MAX_PROP_LENGTH = 35;

    ngOnInit() {
        if (this.info.ref === 'users') {
            this.selectedTitle = 'users';
        } else if (this.info.icon === 'settings/projects' && !this.selectedTitle) {
            this.selectedTitle = this.info.ref;
        } else if (this.info.ref === 'file import') {
            this.selectedTitle = 'file import';
        }
    }
    emitTitle(title) {
        this.emitClickedTitle.emit(title);
    }
}
