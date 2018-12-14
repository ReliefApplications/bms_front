import { Component, OnInit, Input, Inject } from '@angular/core';
import { GlobalText } from 'src/texts/global';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { timer } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { StoredRequests } from 'src/app/model/stored-request';

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
    public columnsToDisplay = ['icon','method', 'target', 'date', 'send'];
    public expandedElement: any | null;

    // Data.
    public requests: StoredRequests;
    public allRequestData = [];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<ModalRequestsComponent>,
    ) { }

    ngOnInit() {
        this.requests = this.data.requests;
        this.allRequestData = this.requests.mixRequests();
        console.log(this.allRequestData);
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    formatDate(date: Date): string {
        let formated: string;

        formated = '' + date.toLocaleString("en-us", { month: "short" }) + ' ';
        formated += ("0" + date.getDay()).slice(-2) + ', ' + date.getFullYear();
        formated += ' at ' + date.getHours() + ':' + date.getSeconds();

        return formated;
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
                    property = key + ' = ';
                    if(body[key] && Object.keys(body[key]).length > 0) {
                        property += '(';
                        Object.keys(body[key]).forEach(
                            (subKey, i) => {
                                if (typeof (body[key][subKey] !== 'object')) {
                                    property += body[key][subKey];
                                } else {
                                    property += subKey + ' : {..}';
                                }
    
                                if( i < Object.keys(body[key]).length-1)
                                    property += ', ';
                            }
                        );
                        property += ')';
                    } else {
                        property += ' ∅ ';
                    }
                    
                }

                details.push(property);
            }
        )

        return details;
    }
}
