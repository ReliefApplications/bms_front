import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { URL_BMS_API } from '../../../environments/environment';
import { UserService } from '../api/user.service';

const api = URL_BMS_API;

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public snackbar: SnackbarService,
        public languageService: LanguageService,
        public userService: UserService,
        public router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {

        const reqMethod: string = req.method;

        return next.handle(req).pipe(
            catchError(
                (error: any, caught: Observable<HttpEvent<any>>) => {
                    if (error.status === 403 && error.error === 'You are not authenticated') {
                        this.userService.setCurrentUser(undefined);
                        this.router.navigate(['/login']);
                    }
                    this.snackErrors(error);
                    return throwError(error);
                }
            )
        );
    }

    snackErrors(response: any) {
        if (response.message || (response.status && response.statusText && response.error)) {
            if (response.status && response.statusText && response.error) {
                if (response.error instanceof Blob) {
                    (this.snackBlobError(response.error));
                }
                else if (typeof response.error !== 'string') {
                    response.error = response.error.error.message;
                }
                this.showSnackbar(response.error);
            } else {
                this.showSnackbar(response.message);
            }
        } else {
            this.showSnackbar(this.language.error_interceptor_msg);
        }
    }

    snackBlobError(convertedBlob: Blob): void {
        const reader = new FileReader();
        reader.onload = (event: any) => {
            const error = <string>reader.result;
            this.showSnackbar(error.replace(/(^"|"$)/g, ''));
        };
        reader.readAsText(convertedBlob);
    }

    showSnackbar(error: string): void {
        this.snackbar.error(error);
    }

}
