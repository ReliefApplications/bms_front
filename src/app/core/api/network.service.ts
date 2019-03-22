import { Injectable } from '@angular/core';
import { Observable, merge, of, fromEvent } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {

    private CONNECTED = true;
    private online$: Observable<boolean>;

    constructor(
        private snackbar: SnackbarService,
        private cacheService: AsyncacheService,
    ) {
        this.online$ = merge(
            // of(navigator.onLine),
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
                    // If the user user is newly connected
                    if (this.CONNECTED) {
                        // this.cacheService.sendStoredRequests();
                    }
                }
            }
        );
    }

    getOnlineObs() {
        return this.online$;
    }

    getStatus(): boolean {
        return (this.CONNECTED);
    }
}
