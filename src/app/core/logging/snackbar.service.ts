import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { UppercaseFirstPipe } from 'src/app/shared/pipes/uppercase-first.pipe';

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
        return this.open(message, this.infoConfig, action);
    }

    public log(message: string, action?: string) {
        return this.open(message, this.logConfig, action);
    }

    public warning(message: string, action?: string) {
        return this.open(message, this.warningConfig, action);
    }

    public error(message: string, action?: string) {
        return this.open(message, this.errorConfig, action);
    }

    public success(message: string, action?: string) {
        return this.open(message, this.successConfig, action);
    }

    private open(message: string, config: MatSnackBarConfig, action?: string) {
        const pipe = new UppercaseFirstPipe();
        return this.snackbar.open(pipe.transform(message), action, config);
    }
}
