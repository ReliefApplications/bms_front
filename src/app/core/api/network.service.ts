import { Injectable } from '@angular/core';
import { Observable, merge, of, fromEvent } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {

    private CONNECTED: boolean = true;
    private online$: Observable<boolean>;

    constructor(
        private snackbar: MatSnackBar,
        private cacheService: AsyncacheService,
    ) {
        this.online$ = merge(
            of(navigator.onLine),
            fromEvent(window, 'online').pipe(mapTo(true)),
            fromEvent(window, 'offline').pipe(mapTo(false))
        )

        this.refreshNetworkStatus();
    }

    refreshNetworkStatus() {
        this.online$.subscribe(
            status => {
                // If connection status has changed
                if (this.CONNECTED !== status) {
                    let newStatusNotification = status ? 'connected to the network' : 'disconnected from the network';
                    this.snackbar.open('You are now ' + newStatusNotification, '', { duration: 5000, horizontalPosition: 'center' });
                    this.CONNECTED = status;
                    // If the user user is newly connected
                    if(this.CONNECTED) {
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