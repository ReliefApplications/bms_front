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

    private debugConfig: MatSnackBarConfig = {
        ...this.snackConfig,
        panelClass: 'snackbar-debug',
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


    public info(message: string) {
        return this.open('Info', message, this.infoConfig);
    }

    public log(message: string) {
        return this.open('Log', message, this.logConfig);
    }

    public warning(message: string) {
        return this.open('Warning', message, this.warningConfig);
    }

    public debug(message: string) {
        return this.open('Debug', message, this.debugConfig);
    }

    public error(message: string) {
        return this.open('Error', message, this.errorConfig);
    }

    public success(message: string) {
        return this.open('Success', message, this.successConfig);
    }

    public reload(message: string) {
        return this.snackbar.open(message, 'Reload', this.snackConfig);
    }

    private open(prefix: string, message: string, config: MatSnackBarConfig) {
        return this.snackbar.open([prefix, message].join(' - '), '', config);
    }
}
