import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-box-report',
    templateUrl: './box-report.component.html',
    styleUrls: ['./box-report.component.scss']
})
export class BoxReportComponent {
    @Input() selectedTitle;
    @Input() info: any;
    @Output() emitClickedTitle = new EventEmitter<string>();

    ngOnInit() {
        
    }

    emitTitle(title) {
        this.emitClickedTitle.emit(title);
    }
}
