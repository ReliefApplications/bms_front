import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CustomIconService {
    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) { }

    /**
     * Register the given svg icons so that they can be used as mat-icon
     *
     * @param icons An array of svg icons: Icon(name, url)
     */
    init(icons: any): void {
        icons.forEach(icon => {
            this.matIconRegistry.addSvgIcon(
                icon.name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(icon.url)
            );
        });
    }

    initializeLoginIcons(): void {
        const iconsArray = [
            {
                name: 'google',
                url: '/assets/icons/icon_google.svg'
            },
            {
                name: 'hid',
                url: '/assets/icons/icon_hid.svg'
            }
        ];
        this.init(iconsArray);
    }
}
