import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class SnackbarService {

    private snackConfig: MatSnackBarConfig =
    {
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        duration: 5000,
    };

    private infoConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-info',
    };

    private logConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-log',
    };

    private warningConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-warning',
    };

    private errorConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-error',
    };

    private successConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-success',
    };

    constructor(
        public snackbar: MatSnackBar,
        ) { }


    public info(message: string, action?: string) {
        return this.open('Info', message, this.infoConfig, action);
    }

    public log(message: string, action?: string) {
        return this.open('Log', message, this.logConfig, action);
    }

    public warning(message: string, action?: string) {
        return this.open('Warning', message, this.warningConfig, action);
    }

    public error(message: string, action?: string) {
        return this.open('Error', message, this.errorConfig, action);
    }

    public success(message: string, action?: string) {
        return this.open('Success', message, this.successConfig, action);
    }

    private open(prefix: string, message: string, config: MatSnackBarConfig, action?: string) {
        return this.snackbar.open([prefix, message].join(' - '), action, config);
    }
}
