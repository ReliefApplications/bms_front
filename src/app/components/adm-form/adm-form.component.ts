import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { LocationService } from 'src/app/core/api/location.service';
import { Location } from 'src/app/models/location';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-adm-form',
  templateUrl: './adm-form.component.html',
  styleUrls: ['./adm-form.component.scss', '../modals/modal-fields/modal-fields.component.scss']
})
export class AdmFormComponent implements OnInit, OnDestroy {

    @Input() form: FormGroup;
    @Input() location: Location;
    @Input() withTitle: Boolean = false;
    @Input() initialValues: number[];
    adm1Subscription: Subscription = null;
    adm2Subscription: Subscription = null;
    adm3Subscription: Subscription = null;
    adm4Subscription: Subscription = null;

    constructor(
        public languageService: LanguageService,
        public locationService: LocationService
    ) { }

    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    ngOnInit() {
        const adm1Id = this.initialValues ? this.initialValues[0] : null;
        const adm2Id = this.initialValues ? this.initialValues[1] : null;
        const adm3Id = this.initialValues ? this.initialValues[2] : null;
        const adm4Id = this.initialValues ? this.initialValues[3] : null;

        this.form.addControl('adm1', new FormControl(adm1Id, [Validators.required]));
        this.form.addControl('adm2', new FormControl(adm2Id));
        this.form.addControl('adm3', new FormControl(adm3Id));
        this.form.addControl('adm4', new FormControl(adm4Id));

        this.adm1Subscription = this.locationService.fillAdm1Options(this.location).subscribe((filledLocation0: Location) => {
            this.location = filledLocation0;
            // Sometimes the adm1 are sent twice because of the cache and we want to call the others only once
            if (adm1Id && !this.adm2Subscription) {
                this.adm2Subscription =  this.locationService.fillAdm2Options(this.location, adm1Id)
                    .subscribe((filledLocation1: Location) => {
                        this.location = filledLocation1;
                        if (adm2Id) {
                            this.adm3Subscription =  this.locationService.fillAdm3Options(this.location, adm2Id)
                                .subscribe((filledLocation2: Location) => {
                                    this.location = filledLocation2;
                                    if (adm3Id) {
                                        this.adm4Subscription = this.locationService.fillAdm4Options(this.location, adm3Id)
                                        .subscribe((filledLocation3: Location) => this.location = filledLocation3);
                                    }
                                });
                        }
                    });
            }
        });
    }

    ngOnDestroy() {
        if (this.adm1Subscription) {
            this.adm1Subscription.unsubscribe();
        }
        if (this.adm2Subscription) {
            this.adm2Subscription.unsubscribe();
        }
        if (this.adm3Subscription) {
            this.adm3Subscription.unsubscribe();
        }
        if (this.adm4Subscription) {
            this.adm4Subscription.unsubscribe();
        }
    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this.locationService.fillAdm1Options(this.location).subscribe((filledLocation: Location) => {
            this.location = filledLocation;
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
                this.location = filledLocation;
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
                this.location = filledLocation;
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
                this.location = filledLocation;
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
