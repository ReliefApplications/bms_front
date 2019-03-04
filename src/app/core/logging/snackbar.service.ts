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

    private debugConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-debug',
    };

    private errorConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-error',
    };

    constructor(
        public snackbar: MatSnackBar,
        ) { }

    public info(message: string) {
        this.open('Info', message, this.infoConfig);
    }

    public log(message: string) {
        this.open('Log', message, this.logConfig);
    }

    public warning(message: string) {
        this.open('Warning', message, this.warningConfig);
    }

    public debug(message: string) {
        this.open('Debug', message, this.debugConfig);
    }

    public error(message: string) {
        this.open('Error', message, this.errorConfig);
    }

    private open(prefix: string, message: string, config: MatSnackBarConfig) {
        this.snackbar.open([prefix, message].join(' - '), '', config);
    }
}
