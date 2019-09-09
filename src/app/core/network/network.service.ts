import { Injectable } from '@angular/core';
import { fromEvent, merge, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { LanguageService } from 'src/app/core/language/language.service';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {

    private CONNECTED: boolean;
    public online$: Observable<boolean>;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;


    constructor(
        private snackbar: SnackbarService,
        protected languageService: LanguageService,
    ) {
        this.online$ = merge(
            fromEvent(window, 'online').pipe(mapTo(true)),
            fromEvent(window, 'offline').pipe(mapTo(false))
        );

        this.refreshNetworkStatus();
    }

    refreshNetworkStatus() {
        if (!this.CONNECTED) {
            this.CONNECTED = navigator.onLine;
        }

        this.online$.subscribe(
            status => {
                // If connection status has changed
                if (this.CONNECTED !== status) {
                    const newStatusNotification =
                        status ? this.language.network_status_connected : this.language.network_status_disconnected;
                    this.snackbar.info(newStatusNotification);
                    this.CONNECTED = status;
                }
            }
        );
    }

    getStatus(): boolean {
        return this.CONNECTED;
    }
}
