import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {

    private CONNECTED = true;
    public online$: Observable<boolean>;

    constructor(
        private snackbar: SnackbarService,
    ) {
        this.online$ = merge(
            fromEvent(window, 'online').pipe(mapTo(true)),
            fromEvent(window, 'offline').pipe(mapTo(false))
        );

        this.refreshNetworkStatus();
    }

    refreshNetworkStatus() {
        this.online$.subscribe(
            status => {
                // If connection status has changed
                if (this.CONNECTED !== status) {
                    const newStatusNotification = status ? 'connected to the network' : 'disconnected from the network';
                    this.snackbar.info('You are now ' + newStatusNotification);
                    this.CONNECTED = status;
                }
            }
        );
    }

    getStatus(): boolean {
        return this.CONNECTED;
    }
}
