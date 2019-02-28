import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-box-setting',
    templateUrl: './box-setting.component.html',
    styleUrls: ['./box-setting.component.scss']
})
export class BoxSettingComponent {

    @Input() isSelected;
    @Input() info: any;

    readonly MAX_PROP_LENGTH = 35;

    ngOnInit() {
    }
}
