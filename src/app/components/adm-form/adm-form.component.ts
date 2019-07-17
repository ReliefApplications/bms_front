import { Component, EventEmitter, Input, OnInit, OnDestroy, AfterViewInit, Output } from '@angular/core';
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
export class AdmFormComponent implements AfterViewInit, OnDestroy {

    @Input() form: FormGroup;
    @Input() location: Location;
    @Input() withTitle: Boolean = false;
    @Input() initialValues: any;
    adm1Subscription: Subscription = null;
    adm2Subscription: Subscription = null;
    adm3Subscription: Subscription = null;
    adm4Subscription: Subscription = null;
    formName: any = {
        adm1: null,
        adm2: null,
        adm3: null,
        adm4: null
    };
    @Output() changeAdm = new EventEmitter<any>();
    @Output() changeForm = new EventEmitter<any>();

    constructor(
        public languageService: LanguageService,
        public locationService: LocationService
    ) { }

    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    ngAfterViewInit() {
        if (!this.initialValues) {
            this.initialValues = {
                adm1: null,
                adm2: null,
                adm3: null,
                adm4: null,

            };
        }
        this.formName['adm1'] = Object.keys(this.initialValues)[0];
        this.formName['adm2'] = Object.keys(this.initialValues)[1];
        this.formName['adm3'] = Object.keys(this.initialValues)[2];
        this.formName['adm4'] = Object.keys(this.initialValues)[3];

        const adm1Id = this.initialValues ? this.initialValues[this.formName['adm1']] : null;
        const adm2Id = this.initialValues ? this.initialValues[this.formName['adm2']] : null;
        const adm3Id = this.initialValues ? this.initialValues[this.formName['adm3']] : null;
        const adm4Id = this.initialValues ? this.initialValues[this.formName['adm4']] : null;

        if (adm4Id) {
            this.changeAdm.emit({admType: 'adm4', admId: adm4Id});
        } else if (adm3Id) {
            this.changeAdm.emit({admType: 'adm3', admId: adm3Id});
        } else if (adm2Id) {
            this.changeAdm.emit({admType: 'adm2', admId: adm2Id});
        } else if (adm1Id) {
            this.changeAdm.emit({admType: 'adm1', admId: adm1Id});
        }

        this.form.addControl(this.formName['adm1'], new FormControl(adm1Id, [Validators.required]));
        this.form.addControl(this.formName['adm2'], new FormControl(adm2Id));
        this.form.addControl(this.formName['adm3'], new FormControl(adm3Id));
        this.form.addControl(this.formName['adm4'], new FormControl(adm4Id));
        this.changeForm.emit();

        if (!this.adm1Subscription) {
            this.adm1Subscription = this.locationService.fillAdm1Options(this.location).subscribe((filledLocation0: Location) => {
                this.location = filledLocation0;
                // Sometimes the adm1 are sent twice because of the cache and we want to call the others only once
                if (adm1Id && !this.adm2Subscription) {
                    this.adm2Subscription =  this.locationService.fillAdm2Options(this.location, adm1Id)
                    .subscribe((filledLocation1: Location) => {
                        this.location = filledLocation1;
                        if (adm2Id && !this.adm3Subscription) {
                            this.adm3Subscription =  this.locationService.fillAdm3Options(this.location, adm2Id)
                            .subscribe((filledLocation2: Location) => {
                                this.location = filledLocation2;
                                        if (adm3Id && !this.adm4Subscription) {
                                            this.adm4Subscription = this.locationService.fillAdm4Options(this.location, adm3Id)
                                            .subscribe((filledLocation3: Location) => this.location = filledLocation3);
                                        }
                                    });
                            }
                        });
                }
            });
        }
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
     *  Get adm2 from the back or from the cache service with the id of adm1
     *  @param adm1Id
     */
    loadDistrict(adm1Id) {
        if (adm1Id) {
            this.changeAdm.emit({admType: 'adm1', admId: adm1Id});
            this.locationService.fillAdm2Options(this.location, adm1Id).subscribe((filledLocation: Location) => {
                this.location = filledLocation;
                this.form.controls[this.formName['adm2']].setValue(null);
                this.form.controls[this.formName['adm3']].setValue(null);
                this.form.controls[this.formName['adm4']].setValue(null);
            });
        }
    }

    /**
     * Get adm3 from the back or from the cahce service with the if of adm2
     * @param adm2Id
     */
    loadCommunity(adm2Id) {
        if (adm2Id) {
            this.changeAdm.emit({admType: 'adm2', admId: adm2Id});
            this.locationService.fillAdm3Options(this.location, adm2Id).subscribe((filledLocation: Location) => {
                this.location = filledLocation;
                this.form.controls[this.formName['adm3']].setValue(null);
                this.form.controls[this.formName['adm4']].setValue(null);
            });
        }
    }

    /**
     *  Get adm4 from the back or from the cahce service with the id of adm3
     * @param adm3Id
     */
    loadVillage(adm3Id) {
        if (adm3Id) {
            this.changeAdm.emit({admType: 'adm3', admId: adm3Id});
            this.locationService.fillAdm4Options(this.location, adm3Id).subscribe((filledLocation: Location) => {
                this.location = filledLocation;
                this.form.controls[this.formName['adm4']].setValue(null);
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
        } else if (adm === 'adm4') {
            this.changeAdm.emit({admType: 'adm4', admId: event});
        }
    }

}
