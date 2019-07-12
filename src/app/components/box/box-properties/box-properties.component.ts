import { Component, HostListener, Input, OnInit } from '@angular/core';
import { CountriesService } from 'src/app/core/countries/countries.service';
import { LanguageService } from 'src/app/core/language/language.service';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { Location } from 'src/app/models/location';

@Component({
    selector: 'app-box-properties',
    templateUrl: './box-properties.component.html',
    styleUrls: ['./box-properties.component.scss']
})
export class BoxPropertiesComponent implements OnInit {

    elementObject = null;

    @Input() displayedInstance: CustomModel;

    private oldComponentDisplayed = null;
    public displayedPropertyNames: any;
    public numColumns = 0;
    public displayLength: number;

    readonly MAX_PROP_LENGTH = 20;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    public countryId = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');

    constructor (
        public languageService: LanguageService,
        public countryService: CountriesService
    ) {}

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.getNumberOfColumns();
    }


    ngOnInit() {
        const allPropertyNames = Object.keys(this.displayedInstance.fields);
        this.displayedPropertyNames = allPropertyNames.filter(property => {
            return this.displayedInstance.fields[property].isDisplayedInSummary === true;
        });
        this.getNumberOfColumns();
    }

    cleanUsefullProperties() {
        const cleaned = new Array();

        this.displayedPropertyNames.forEach(
            element => {
                if (element && this.elementObject[element] !== ''
                && this.elementObject[element] !== {} && this.elementObject[element] !== undefined) {
                    cleaned.push(element);
                }
            }
        );

        this.displayedPropertyNames = cleaned;
    }

    isArray(obj: any) {
        return Array.isArray(obj);
    }

    isNumber(obj: any) {
        return (typeof (obj) === 'number');
    }

    isString(obj: any) {
        return (typeof (obj) === 'string');
    }

    isLocation(obj: any) {
        return (obj instanceof Location);
    }

    getLocationTitle(location: Location) {
        const adm = this.getMorePreciseAdm(location);
        return this.language[adm][this.countryId];
    }

    getLocationValue(location: Location) {
        return location.getPreciseLocationName();
    }

    getMorePreciseAdm(location: Location) {
        if (location.get('adm4') && location.get('adm4').get('name')) {
            return 'adm4';
        } else  if (location.get('adm3') && location.get('adm3').get('name')) {
            return 'adm3';
        } else  if (location.get('adm2') && location.get('adm2').get('name')) {
            return 'adm2';
        } else {
            return 'adm1';
        }
    }

    getNumberOfColumns(): void {
        const length = Object.keys(this.displayedPropertyNames).length;
        if (window.innerWidth > 700) {
            this.numColumns = length;
        } else if (window.innerWidth > 500 && window.innerWidth < 700) {
            this.numColumns = length / 2;
        } else {
            this.numColumns = length / 3;
        }
    }
}
