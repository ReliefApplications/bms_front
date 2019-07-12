import { Country } from 'src/app/models/country';

export interface CachedCountryValue {
    countryId: string;
    updatedInLastSession: boolean;
}

export interface CachedCountryReturnValue {
    country: Country;
    updatedInLastSession: boolean;
}
