import { Injectable } from '@angular/core';
import * as CountryIso from 'country-iso-3-to-2';
import { PHONECODES } from '../../models/constants/phone-codes';
import { Phone } from '../../models/phone';
@Injectable({
    providedIn: 'root'
})
export class PhoneService {

    // Country Codes (PhoneNumber lib)
    private getCountryISO2 = CountryIso;
    public countryCodesList = PHONECODES;

    constructor(
    ) {
    }

    getPhonePrefix(phone: Phone, countryISO3) {
        let phoneCode;
        const phonePrefix = phone.get<string>('prefix');

        if (phonePrefix) {
            return this.countryCodesList.filter(element => element.split('- ')[1] === phonePrefix)[0];
        } else {
            const countryCode = String(this.getCountryISO2(String(countryISO3)));
            phoneCode = this.countryCodesList.filter(element => element.split(' -')[0] === countryCode)[0];
            return phoneCode ? phoneCode : null;
        }
    }
}
