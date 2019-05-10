import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class UpdateService {

    constructor(
        private snackbar: SnackbarService,
        public updates: SwUpdate,
    ) {
        updates.checkForUpdate();

        updates.available.subscribe(
            _event => {
                const snack = this.snackbar.info('An update is available', 'Reload');
                snack.onAction().subscribe(() => {
                    window.location.reload();
                });

                setTimeout(() => {
                    snack.dismiss();
                }, 6000);
            }
        );
    }
}
