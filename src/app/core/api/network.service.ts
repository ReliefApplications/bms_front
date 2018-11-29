import { Injectable } from '@angular/core';
import { Observable, merge, of, fromEvent, interval } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { componentRefresh } from '@angular/core/src/render3/instructions';
import { MatSnackBar, MatIcon } from '@angular/material';
import { IconSvgComponent } from 'src/app/components/icon-svg/icon-svg.component';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {

    private CONNECTED: boolean = true;
    private online$: Observable<boolean>;

    constructor(
        private snackbar: MatSnackBar,
        updates: SwUpdate
    ) {
        this.online$ = merge(
            of(navigator.onLine),
            fromEvent(window, 'online').pipe(mapTo(true)),
            fromEvent(window, 'offline').pipe(mapTo(false))
        )

        updates.available.subscribe(event => {
            this.snackbar.open('Current BMS version is' + event.current, '', { duration: 5000, horizontalPosition: 'center' });
            this.snackbar.open('Available BMS version is' + event.available, '', { duration: 5000, horizontalPosition: 'center' });
            // if (promptUser(event)) {
            //     updates.activateUpdate().then(() => document.location.reload());
            // }
        });
        updates.activated.subscribe(event => {
            this.snackbar.open('Old BMS version was' + event.previous, '', { duration: 5000, horizontalPosition: 'center' });
            this.snackbar.open('New BMS version is' + event.current, '', { duration: 5000, horizontalPosition: 'center' });
        });
        interval(1000*60*60*24).subscribe(() => updates.checkForUpdate()); //CheckUpdateEveryDay

        this.refreshNetworkStatus();
    }

    refreshNetworkStatus() {
        this.online$.subscribe(
            status => {
                if (this.CONNECTED !== status) {
                    let newStatusNotification = status ? 'connected to the network' : 'disconnected from the network';
                    this.snackbar.open('You are now ' + newStatusNotification, '', { duration: 5000, horizontalPosition: 'center' });
                    this.CONNECTED = status;
                }
            }
        )
    }

    public getStatus(): boolean {
        return (this.CONNECTED);
    }
}