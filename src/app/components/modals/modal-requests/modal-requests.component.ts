import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable, of } from 'rxjs';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { FailedRequest, StoredRequest } from 'src/app/models/interfaces/stored-request';
import { catchError } from 'rxjs/operators';

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
    // TODO: Translations

    // Table constants.
    public columnsToDisplay = ['icon', 'method', 'target', 'date', 'actions'];
    public expandedElement: any | null;

    // Data.
    public requests: StoredRequest[];
    public loading = false;

    // When sending all.
    public inProgress = false;
    public progressCountSuccess = 0;
    public progressCountFail = 0;
    public errors: Array<FailedRequest>;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    constructor(
        private dialogRef: MatDialogRef<ModalRequestsComponent>,
        private cacheService: AsyncacheService,
        private snackbar: SnackbarService,
        public languageService: LanguageService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit() {
        this.requests = this.data.requests;
    }

    closeDialog(): void {
        this.dialogRef.close(true);
    }

    formatDate(date: Date): string {
        let formated: string;
        formated = '' + date.toLocaleString('en-us', { month: 'short' }) + ' ';
        formated += date.toLocaleString('en-us', { day: '2-digit' }) + ', ' + date.getFullYear();
        formated += ' at ' + date.getHours() + ':' + date.toLocaleString('en-us', { minute: '2-digit' });

        return formated;
    }

    sendRequest(request: StoredRequest) {
        const method = this.cacheService.useMethod(request);
        if (method) {
            this.loading = true;
            method.subscribe(
                (requestResult) => {
                    if (requestResult instanceof FailedRequest) {
                        this.snackbar.error('Error while sending request: ' + requestResult.error);
                        this.loading = false;
                    } else {
                        this.snackbar.success(request.method + ' ' + request.url.split('wsse/')[1] + ' was sent');
                        this.requests.splice(this.requests.indexOf(request), 1);
                        this.cacheService.set(AsyncacheService.PENDING_REQUESTS, this.requests).subscribe(
                            () => this.loading = false
                        );
                    }
                }
            );
        }
    }

    sendAllRequests() {
        this.errors = [];
        this.inProgress = true;
        const stillToBeSent = this.requests;

        this.requests.forEach((request) => {
            const method = this.cacheService.useMethod(request);
            if (method) {
                method.subscribe(requestResult => {
                    if (requestResult instanceof FailedRequest) {
                        this.errors.push(requestResult);
                        this.progressCountFail++;
                    } else {
                        this.progressCountSuccess++;
                        this.snackbar.success(request.method + ' ' + request.url.split('wsse/')[1] + ' was sent');
                        stillToBeSent.splice(stillToBeSent.indexOf(request), 1);
                    }

                    if (this.getProgressValue() === 100) {
                        this.requests = stillToBeSent;
                        this.cacheService.set(AsyncacheService.PENDING_REQUESTS, stillToBeSent).subscribe(
                            () => {
                                this.inProgress = false;
                                if (! this.requests || this.requests === []) {
                                    this.closeDialog();
                                }
                            }
                        );
                    }

                });
            }
        });
    }

    getProgressValue() {
        return (this.progressCountSuccess + this.progressCountFail) / this.requests.length * 100;
    }

    removeRequest(element: StoredRequest) {
        this.requests.splice(this.requests.indexOf(element), 1);
        this.loading = true;
        this.cacheService.set(AsyncacheService.PENDING_REQUESTS, this.requests).subscribe(
            _ => this.loading = false
        );
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
                                    if (typeof (body[key][subKey]) !== 'object') {
                                        property += body[key][subKey];
                                    } else {
                                        property += '{...}';
                                    }

                                    if (i < Object.keys(body[key]).length - 1) {
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
