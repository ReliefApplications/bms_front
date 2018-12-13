import { Component, OnInit, Input, Inject } from '@angular/core';
import { GlobalText } from 'src/texts/global';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { timer } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-modal-requests',
    templateUrl: './modal-requests.component.html',
    styleUrls: ['./modal-requests.component.scss'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class ModalRequestsComponent implements OnInit {

    public TEXTS = GlobalText.TEXTS;

    // Table constants.
    public tableColumns = ['Target', 'Content', 'Send'];

    // Data.
    public requests: Array<any>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<ModalRequestsComponent>,
    ) { }

    ngOnInit() {
        this.requests = this.data.requests;
        timer(1000).subscribe(res => { console.log(this.data.requests); });
    }

    public closeDialog(): void {
        this.dialogRef.close(true);
    }

    sendRequest(element: Object) {
        console.log(element);
    }

    expandBody(body: Object): Array<string> {
        let details = [];

        Object.keys(body).forEach(
            (key) => {
                let property = '';

                if (typeof (body[key]) !== 'object') {
                    property = key + ' = ' + body[key];
                }
                else {
                    property = key + ' = (';
                    Object.keys(body[key]).forEach(
                        (subKey, i) => {
                            if (typeof (body[key][subKey] !== 'object')) {
                                property += subKey + ' = ' + body[key][subKey];
                            } else {
                                property += subKey + ' = {...}';
                            }

                            if (i === Object.keys(body[key]).length - 1) {
                                property += ')';
                            } else {
                                property += ', ';
                            }
                        }
                    )
                }

                details.push(property);
            }
        )

        return details;
    }
}
