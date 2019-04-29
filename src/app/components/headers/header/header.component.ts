import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { UserService } from 'src/app/core/api/user.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { LanguageService } from 'src/texts/language.service';
import { Country } from './../../../model/user.new';
import { ModalLanguageComponent } from './../../modals/modal-language/modal-language.component';



@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent implements OnInit {

    countries: Array<Country>;
    selectedCountry: Country;

    // Language
    public language = this.languageService.selectedLanguage;

    constructor(
        private dialog: MatDialog,
        private languageService: LanguageService,
        private userService: UserService,
        private asynCacheService: AsyncacheService,
    ) {}

    ngOnInit(): void {
        this.countries = this.getCountries();
        this.selectedCountry = this.countries[0];
    }

//
// ─── COUNTRIES MANAGEMENT ───────────────────────────────────────────────────────
//

    private getCountries(): Array<Country> {
        if (this.userService.hasRights('ROLE_ACCESS_ALL_COUNTRIES')) {
            return this.getAllExistingCountries();
        }
        return this.getUserCountries();
    }

    private getAllExistingCountries(): Array<Country> {
        return this.userService.currentUser.fields.countries.options;
    }

    private getUserCountries(): Array<Country> {
        return this.userService.currentUser.get('country');
    }

    public selectCountry(country: Country): void {
        this.asynCacheService.setCountry(country);
        window.location.reload();
    }

//
// ─── LANGUAGE ───────────────────────────────────────────────────────────────────
//

    openLanguageDialog() {
        this.dialog.open(ModalLanguageComponent, {});
    }
}
