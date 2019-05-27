import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {

    constructor(
        private snackbar: SnackbarService,
        private updates: SwUpdate,
    ) {}

    public checkForUpdates(): Observable<any> {
        return this.updates.available.pipe(
            tap((event: any) => {
                // tslint:disable-next-line
                console.log(event);
                const snack = this.snackbar.info('An update is available', 'Reload');

                snack.onAction().subscribe(() => {
                    this.updates.activateUpdate().then(() => {
                        window.location.reload();
                    });
                });

                setTimeout(() => {
                    snack.dismiss();
                }, 6000);
            })
        );
    }
}
