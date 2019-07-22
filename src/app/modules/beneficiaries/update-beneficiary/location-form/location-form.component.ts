import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { HouseholdLocationType } from 'src/app/models/household-location';

@Component({
    selector: 'app-location-form',
    templateUrl: './location-form.component.html',
    styleUrls: ['./location-form.component.scss', '../update-beneficiary.component.scss']
})
export class LocationFormComponent {

    constructor(
        public languageService: LanguageService,
        public countryService: CountriesService,
    ) { }

    @Input() locations: Array<any>;
    @Input() form: FormGroup;
    @Input() householdLocationTypes: Array<HouseholdLocationType>;
    @Input() campLists: Array<any>;
    @Input() locationGroup: string;

    @Output() changeAdm = new EventEmitter<any>();
    @Output() changeForm = new EventEmitter<any>();

    // Location initial values
    @Input() initialAdms: any = {};
    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    public countryId = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');


    loadCamps(event, locationGroup) {
        this.changeAdm.emit({
            prefix: locationGroup,
            admType: event.admType,
            admId: event.admId
        });
    }

    emitChangeForm() {
        this.changeForm.emit();
    }
}
