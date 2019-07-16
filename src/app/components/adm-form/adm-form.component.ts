import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { LocationService } from 'src/app/core/api/location.service';
import { Location } from 'src/app/models/location';

@Component({
  selector: 'app-adm-form',
  templateUrl: './adm-form.component.html',
  styleUrls: ['./adm-form.component.scss', '../modals/modal-fields/modal-fields.component.scss']
})
export class AdmFormComponent implements OnInit {

    @Input() form: FormGroup;
    @Input() location: Location;
    @Input() withTitle: Boolean = false;

    constructor(
        public languageService: LanguageService,
        public locationService: LocationService
    ) { }

    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    ngOnInit() {
        this.loadProvince();
        this.form.controls.adm1.setValidators([Validators.required]);

    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this.locationService.fillAdm1Options(this.location).subscribe((filledLocation: Location) => {
            this.location.set('location', filledLocation);
            this.form.controls.adm2.setValue(null);
            this.form.controls.adm3.setValue(null);
            this.form.controls.adm4.setValue(null);
        });
    }

    /**
     *  Get adm2 from the back or from the cache service with the id of adm1
     *  @param adm1Id
     */
    loadDistrict(adm1Id) {
        if (adm1Id) {
            this.locationService.fillAdm2Options(this.location, adm1Id).subscribe((filledLocation: Location) => {
                this.location.set('location', filledLocation);
                this.form.controls.adm2.setValue(null);
                this.form.controls.adm3.setValue(null);
                this.form.controls.adm4.setValue(null);
            });
        }
    }

    /**
     * Get adm3 from the back or from the cahce service with the if of adm2
     * @param adm2Id
     */
    loadCommunity(adm2Id) {
        if (adm2Id) {
            this.locationService.fillAdm3Options(this.location, adm2Id).subscribe((filledLocation: Location) => {
                this.location.set('location', filledLocation);
                this.form.controls.adm3.setValue(null);
                this.form.controls.adm4.setValue(null);
            });
        }
    }

    /**
     *  Get adm4 from the back or from the cahce service with the id of adm3
     * @param adm3Id
     */
    loadVillage(adm3Id) {
        if (adm3Id) {
            this.locationService.fillAdm4Options(this.location, adm3Id).subscribe((filledLocation: Location) => {
                this.location.set('location', filledLocation);
                this.form.controls.adm4.setValue(null);
            });
        }
    }

    loadAdm(adm, event) {
        if (adm === 'adm1') {
            this.loadDistrict(event);
        } else if (adm === 'adm2') {
            this.loadCommunity(event);
        } else if (adm === 'adm3') {
            this.loadVillage(event);
        }
    }

}
