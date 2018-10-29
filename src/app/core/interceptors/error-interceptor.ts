import { Injectable } from '@angular/core';
import {
	HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEventType
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BMS_API } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { NetworkService } from '../api/network.service';

const api = URL_BMS_API;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        public snackbar : MatSnackBar,
        private networkService : NetworkService,
    ){}

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        let reqMethod : String = req.method;

        return next.handle(req).pipe(
            catchError(
                (error: any, caught: Observable<HttpEvent<any>>) => {
                    this.snackErrors(error);
                    return of(error);
                }
            )
        );
    }

    snackErrors(response : any) {
        if(response.status === 0 && !this.networkService.getStatus()) {
            this.snackbar.open('No network connection', '', {duration: 4000, horizontalPosition: 'center'});            
        } else if (response.message || (response.status && response.statusText && response.error) ) {
            if(response.status && response.statusText && response.error) {
                this.snackbar.open(response.statusText + ' (' + response.status + ') - ' + response.error, '', {duration: 4000, horizontalPosition: 'center'});
            } else {
                this.snackbar.open(response.message, '', {duration: 4000, horizontalPosition: 'center'});
            }
        } else {
            this.snackbar.open('An error occured, request has failed (Empty back response).', '', {duration: 4000, horizontalPosition: 'center'});
        }
    }

}
