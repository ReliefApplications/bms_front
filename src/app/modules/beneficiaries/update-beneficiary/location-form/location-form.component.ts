import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { HouseholdLocationType } from 'src/app/models/household-location';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss', '../update-beneficiary.component.scss']
})
export class LocationFormComponent implements OnInit {

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

  // Language
  public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

  public countryId = this.countryService.selectedCountry.getValue().get<string>('id') ?
      this.countryService.selectedCountry.getValue().get<string>('id') :
      this.countryService.khm.get<string>('id');

  ngOnInit() {
  }

  loadAdm(type, adm, event) {
    const change = {
      type: type,
      adm: adm,
      id: event
    };
    this.changeAdm.emit(change);
  }

}
