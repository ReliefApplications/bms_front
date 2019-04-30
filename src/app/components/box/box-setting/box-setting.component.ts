import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-box-setting',
    templateUrl: './box-setting.component.html',
    styleUrls: ['./box-setting.component.scss']
})
export class BoxSettingComponent {
    @Input() isSelected: boolean;
    // Todo: Remove this
    @Input() selectedTitle: string;
    @Input() info: any;
    @Output() emitClickedTitle = new EventEmitter<string>();
    @Output() emitClickedEntity = new EventEmitter<any>();

    readonly MAX_PROP_LENGTH = 35;
}
