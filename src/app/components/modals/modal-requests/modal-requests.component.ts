import { Component, OnInit, DoCheck, Inject } from '@angular/core';
import { GlobalText } from 'src/texts/global';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { StoredRequestInterface } from 'src/app/model/stored-request';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { timer, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

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
export class ModalRequestsComponent implements OnInit, DoCheck {

    public modal = GlobalText.TEXTS;
    public language = GlobalText.language;

    // Table constants.
    public columnsToDisplay = ['icon', 'method', 'target', 'date', 'actions'];
    public expandedElement: any | null;

    // Data.
    public requests: StoredRequestInterface[];
    public loading = false;

    // When sending all.
    public inProgress = false;
    public progressLength = 0;
    public progressCountSuccess = 0;
    public progressCountFail = 0;
    public errors: Array<any>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<ModalRequestsComponent>,
        private cacheService: AsyncacheService,
        private snackbar: MatSnackBar,
    ) { }

    ngOnInit() {
        this.requests = this.data.requests;
    }

    ngDoCheck() {
        if (this.requests && this.requests.length === 0 && !this.loading && !this.inProgress) {
            timer(1000).subscribe(
                result => {
                    this.closeDialog();
                }
            );
        }
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    formatDate(date: Date): string {
        let formated: string;
        formated = '' + date.toLocaleString('en-us', { month: 'short' }) + ' ';
        formated += date.toLocaleString('en-us', { day: '2-digit' }) + ', ' + date.getFullYear();
        formated += ' at ' + date.getHours() + ':' + date.toLocaleString('en-us', {minute: '2-digit' });

        return formated;
    }

    sendRequest(element: StoredRequestInterface) {
        const method = this.cacheService.useMethod(element);
        if (method) {
            this.loading = true;
            method.subscribe(
                response => {
                    this.snackbar.open(element.method + ' ' + element.url.split('wsse/')[1] + ' have been sent',
                    '', {duration: 3000, horizontalPosition: 'center'});
                    this.requests.splice(this.requests.indexOf(element), 1);
                    this.cacheService.set(AsyncacheService.PENDING_REQUESTS, this.requests);
                    this.loading = false;
                },
                error => {
                    this.snackbar.open('Error while sending request: ' + error, '', {duration: 3000, horizontalPosition: 'center'});
                    this.loading = false;
                }
            );
        }
    }

    sendAllRequests() {
        this.inProgress = true;
        const size = this.requests.length;
        const stillToBeSent = [];

        this.cacheService.sendAllStoredRequests()
        .subscribe(
            (result) => {
                if (result) {
                    this.progressLength = size;
                    this.errors = [];

                    result
                    .subscribe(
                        (value) => {
                            // FailedRequestInterface format.
                            if (value && value.fail && value.request && value.error) {
                                stillToBeSent.push(value.request);
                                this.errors.push(value.error);
                                this.progressCountFail++;
                            } else {
                                this.progressCountSuccess++;
                            }
                            // End.
                            if (this.progressCountFail + this.progressCountSuccess === this.progressLength) {
                                this.cacheService.set(AsyncacheService.PENDING_REQUESTS, stillToBeSent);
                            }

                        },
                        error => {
                            this.snackbar.open(error, '', {duration: 3000, horizontalPosition: 'center'});
                        }
                    );
                }
            },
            () => {
                this.snackbar.open('An error occured when regrouping pending requests to be sent.',
                '', {duration: 3000, horizontalPosition: 'center'});
            }
        );

        this.requests = stillToBeSent;
    }

    getProgressValue() {
        return ((this.progressCountSuccess + this.progressCountFail) / this.progressLength) * 100;
    }

    removeRequest(element: StoredRequestInterface) {
        this.requests.splice(this.requests.indexOf(element), 1);
        this.cacheService.set(AsyncacheService.PENDING_REQUESTS, this.requests);
        this.loading = true;
        timer(200).subscribe( result => {this.loading = false; });
    }

    expandBody(body: Object): Array<string> {
        const details = [];

        if (body) {
            Object.keys(body).forEach(
                (key) => {
                    let property = '';

                    if (typeof (body[key]) !== 'object') {
                        property = key + ' = ' + body[key];
                    } else {
                        property = key + ' = ';
                        if (body[key] && Object.keys(body[key]).length > 0) {
                            property += '(';
                            Object.keys(body[key]).forEach(
                                (subKey, i) => {
                                    if (typeof(body[key][subKey]) !== 'object') {
                                        property += body[key][subKey];
                                    } else {
                                        property += '{...}';
                                    }

                                    if ( i < Object.keys(body[key]).length - 1) {
                                        property += ', ';
                                    }
                                }
                            );
                            property += ')';
                        } else {
                            property += ' ∅ ';
                        }

                    }

                    details.push(property);
                }
            );
        }

        return details;
    }
}
