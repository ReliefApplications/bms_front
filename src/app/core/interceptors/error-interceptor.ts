import { Injectable } from '@angular/core';
import {
	HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEventType, HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { URL_BMS_API } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { GlobalText } from '../../../texts/global';

const api = URL_BMS_API;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        public snackbar : MatSnackBar,
    ){}

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        let reqMethod : String = req.method;

        return next.handle(req).pipe(
            catchError(
                (error: any, caught: Observable<HttpEvent<any>>) => {
                    this.snackErrors(error);
                    console.log('Intercepted:', error);
                    return throwError(error);
                }
            )
        );

        // return next.handle(req).
        //     (event: HttpEvent<any>) => {}, (err: any) => {
        //     if (err instanceof HttpErrorResponse) {
        //       this.snackErrors(err);
        //     }
        //   }
        // );
    }

    snackErrors(response : any) {
        if (response.message || (response.status && response.statusText && response.error) ) {
            if(response.status && response.statusText && response.error) {
                if(typeof response.error !== 'string') {
                    response.error = response.error.error.message;
                }
                this.snackbar.open(response.statusText + ' (' + response.status + ') - ' + response.error, '', {duration: 5000, horizontalPosition: 'center'});
            } else {
                this.snackbar.open(response.message, '', {duration: 5000, horizontalPosition: 'center'});
            }
        } else {
            this.snackbar.open(GlobalText.TEXTS.error_interceptor_msg, '', {duration: 5000, horizontalPosition: 'center'});
        }
    }

}
