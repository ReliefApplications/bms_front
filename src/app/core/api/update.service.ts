import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class UpdateService {

    constructor(
        private snackbar: SnackbarService,
        private updates: SwUpdate,
    ) {
        this.updates.available.subscribe(
            event => {
                const snack = this.snackbar.reload('BMS Update is available');

                snack
                    .onAction()
                    .subscribe(() => {
                    window.location.reload();
                    });

                setTimeout(() => {
                    snack.dismiss();
                }, 6000);
            }
        );
    }
}
