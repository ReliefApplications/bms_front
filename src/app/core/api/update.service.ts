import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { MatSnackBar } from '@angular/material';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class UpdateService {

    constructor(
        private snackbar: MatSnackBar,
        private updates: SwUpdate,
    ) {
        console.log('update check launched');
        this.updates.available.subscribe(
            event => {
                let response = confirm('A new version of the application is available, do you want to load it?');
                if (response) {
                    this.updates.activateUpdate().then(
                        () => {
                            document.location.reload();
                        }
                    );
                }
            }
        );
    }

    ngOnInit() {
        this.updates.checkForUpdate();        
    }
}