import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { DisplayType } from 'src/app/models/constants/screen-sizes';

@Component({
    selector: 'app-box-setting',
    templateUrl: './box-setting.component.html',
    styleUrls: ['./box-setting.component.scss']
})
export class BoxSettingComponent implements OnInit, OnDestroy {
    @Input() isSelected: boolean;
    // Todo: Remove this
    @Input() selectedTitle: string;
    @Input() info: any;
    @Output() emitClickedTitle = new EventEmitter<string>();
    @Output() emitClickedEntity = new EventEmitter<any>();

    readonly MAX_PROP_LENGTH = 35;
    readonly MAX_PROP_LENGTH_MOBILE = 25;

    public maxLength = this.MAX_PROP_LENGTH;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    constructor(
        private screenSizeService: ScreenSizeService,
    ) {
     }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
            if (this.currentDisplayType.type === 'mobile') {
                this.maxLength = this.MAX_PROP_LENGTH_MOBILE;
            } else {
                this.maxLength = this.MAX_PROP_LENGTH;
            }
        });
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
    }
}
