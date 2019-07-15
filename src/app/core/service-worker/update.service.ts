import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { LanguageService } from 'src/app/core/language/language.service';

@Injectable({
    providedIn: 'root'
})
export class UpdateService {

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private snackbar: SnackbarService,
        private updates: SwUpdate,
        public languageService: LanguageService,
    ) {}

    public checkForUpdates(): Observable<any> {
        return this.updates.available.pipe(
            tap((event: any) => {
                const snack = this.snackbar.info(this.language.snackbar_update, 'Reload');

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
