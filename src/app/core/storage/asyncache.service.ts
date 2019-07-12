import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Country } from 'src/app/models/country';
import { Distribution } from 'src/app/models/distribution';
import { DistributionBeneficiary } from 'src/app/models/distribution-beneficiary';
import { FailedRequest, StoredRequest } from 'src/app/models/interfaces/stored-request';
import { Project } from 'src/app/models/project';
import { User } from 'src/app/models/user';
import { CountriesService } from '../countries/countries.service';
import { Language } from '../language/language';
import { LanguageService } from '../language/language.service';
import { CachedItemInterface } from './cached-item.interface';

@Injectable({
    providedIn: 'root'
})
export class AsyncacheService {
    //  Country

    // Request storing
    static pendingRequests = false;

    // Keys
    static readonly USER = 'user';
    static readonly USERS = 'users';
    static readonly DISTRIBUTIONS = 'distributions';
    static readonly UPCOMING = 'upcoming';
    static readonly DONORS = 'donors';
    static readonly PROJECTS = 'projects';
    static readonly DISTRIBUTION_PROJECT = 'distributions_project';
    static readonly SECTORS = 'sectors';
    static readonly HOUSEHOLDS = 'households';
    static readonly CRITERIAS = 'criterias';
    static readonly COMMODITY = 'commodity';
    static readonly ADM1 = 'adm1';
    static readonly ADM2 = 'adm2';
    static readonly ADM3 = 'adm3';
    static readonly ADM4 = 'adm4';
    static readonly MAPSDATA = 'mapsData';
    static readonly SPECIFICS = 'specifics';
    static readonly MODALITIES = 'modalities';
    static readonly VULNERABILITIES = 'vulnerabilities';
    static readonly SUMMARY = 'summary';
    static readonly COUNTRY = 'country';
    static readonly PENDING_REQUESTS = 'pending_requests';
    static readonly LANGUAGE = 'language';


    // Constants
    readonly PREFIX = 'bms';
    readonly SECTIMEOUT = 2592000; // 30 day in seconds
    readonly MSTIMEOUT = this.SECTIMEOUT * 1000;

    constructor(
        public languageService: LanguageService,
        private countriesService: CountriesService,
        protected storage: LocalStorage,
        protected http: HttpClient,
    ) {
    }

    //
    // ─── KEY FORMATTING ──────────────────────────────────────────────────────────────────────
    //

    private getFormattedKey(key: string): Observable<string> {
        // Non country-specific data
        if (key === AsyncacheService.COUNTRY || key === AsyncacheService.USER || key === AsyncacheService.USERS
            || key === AsyncacheService.PENDING_REQUESTS || key === AsyncacheService.LANGUAGE) {
            return of(this.PREFIX + '_' + key);
        } else if (this.countriesService.selectedCountry) {
            return of(this.formatKeyCountry(key, this.countriesService.selectedCountry));
        } else {
            return this.getCountry().pipe(
                map((country: Country) => {
                    return this.formatKeyCountry(key, country);
                })
            );
        }
    }

    private formatKeyCountry(key: string, country: Country) {
        return this.PREFIX + '_' + country.get<string>('id') + '_' + key;
    }

    //
    // ─── GET, SET, DELETE, CLEAR ──────────────────────────────────────────────────────────────────────
    //

    /**
     * Get an item from the cache asynchronously.
     * @param key
     */
    get(key: string) {
        return (
            this.getFormattedKey(key).pipe(
                switchMap((formattedKey: string) => {
                    return this.storage.getItem(formattedKey).pipe(
                        map(
                            (result: CachedItemInterface) => {
                                if (result && result.storageTime + result.limit < (new Date).getTime()) {
                                    if (result.canBeDeleted) {
                                        this.removeItem(formattedKey);
                                    }
                                    return null;
                                } else if (result) {
                                    return result.value;
                                } else {
                                    return null;
                                }
                            }
                        )
                    );
                })
            )

        );
    }

    /**
     * Observable version of set
     * @param key
     * @param value
     * @param options
     */
    set(key: string, value: any, options: any = {}): Observable<boolean> {
        return this.getFormattedKey(key).pipe(
            switchMap((formattedKey: string) => {

                // this.localStorage.setItemSubscribe(formattedKey, value);
                if (options.canBeDeleted == null) {
                    options.canBeDeleted = true;
                }

                if (options.timeout == null) {
                    options.timeout = this.MSTIMEOUT;
                }

                const object: CachedItemInterface = {
                    storageTime: (new Date()).getTime(), // in milliseconds
                    value: value,
                    limit: options.timeout, // in milliseconds
                    canBeDeleted: options.canBeDeleted
                };
                return this.storage.setItem(formattedKey, object);
            }),
        );
    }

    removeItem(key: string) {
        return this.getFormattedKey(key).pipe(
            tap((formattedKey: string) => {
                this.storage.removeItemSubscribe(formattedKey);
            }),
        );
    }

    /**
     * Clear all the cache.
     * @param force - `true` to clear all the cache, `false` to exclude some fields
     * @param excludedFields - fields to keep after the clear
     */
    clear(force: boolean = true, excludedFields?: string[]) {
        // If force is true, clear all the storage
        if (force || !excludedFields) {
            return this.storage.clear();
        } else {
            /** Object that will contain the fields that should remain in the storage and their value */
            const keptFields = {};
            /** Array of `storage.getItem` observables that will be subscribed to get the values of the fields we want to keep */
            const observables = [];
            // Push all the observables in the array
            for (const field of excludedFields) {
                this.countriesService.enabledCountries.forEach((country: Country) => {
                    observables.push(this.storage.getItem(this.formatKeyCountry(field, country)));
                });
            }

            /**
             * Subscribe in parallel to all the observables of the `observables` array
             * and store the results in the `keptFields` object
             */
            return forkJoin(...observables)
                .pipe(
                    map(results => {
                        for (let i = 0; i < results.length; i++) {
                            this.countriesService.enabledCountries.forEach((country: Country) => {
                                keptFields[this.formatKeyCountry(excludedFields[i], country)] = results[i];
                            });
                        }
                    }),
                    /**
                     * Then delete all the cache and make a `setItem` for all the fields we wanted to save
                     */
                    switchMap(_ => {
                        return this.storage.clear()
                            .pipe(
                                map(v => {
                                    const keys = Object.keys(keptFields);
                                    for (const key of keys) {
                                        this.storage.setItem(key, keptFields[key]).subscribe();
                                    }
                                })
                            );
                    })
                );
        }
    }

    //
    // ─── LANGUAGE UTILS ──────────────────────────────────────────────────────────────────────
    //

    setLanguage(language: Language): Observable<any> {
        return this.set(AsyncacheService.LANGUAGE, this.languageService.languageToString(language));
    }

    getLanguage(): Observable<Language> {
        return this.get(AsyncacheService.LANGUAGE).pipe(
            map((languageString: string) => {
                if (!languageString) {
                    return undefined;
                }
                return this.languageService.stringToLanguage(languageString);
            })
        );
    }

    //
    // ─── COUNTRY UTILS ──────────────────────────────────────────────────────────────────────
    //

    setCountry(country: Country): Observable<boolean> {
        return this.set(AsyncacheService.COUNTRY, country.get<string>('id'));
    }

    getCountry(): Observable<Country> {
        // countries are stored in user object
        const countries: Array<Country> = this.countriesService.enabledCountries;
        if (this.countriesService.selectedCountry) {
            return of(this.countriesService.selectedCountry);
        }
        return this.get(AsyncacheService.COUNTRY).pipe(
            map((countryId: string) => {
                for (const country of countries) {
                    if (country.get<string>('id') === countryId) {
                        return country;
                    }
                }
                return undefined;
            }),
        );
    }

    removeCountry() {
        return this.removeItem(AsyncacheService.COUNTRY).subscribe();
    }
    removeLanguage() {
        return this.removeItem(AsyncacheService.LANGUAGE).subscribe();
    }

    //
    // ─── USER UTILS ──────────────────────────────────────────────────────────────────────
    //

    setUser(user: any): Observable<boolean> {
        return this.set(AsyncacheService.USER, user);
    }

    /**
     * Waits for asynchronous user value to return it synchronously.
    */
    getUser(): Observable<User> {
        return this.get(AsyncacheService.USER).pipe(
            map((cachedUser: object) => {
                if (!cachedUser) {
                    return undefined;
                } else {
                    return User.apiToModel(cachedUser);
                }
            }
            ),
        );
    }

    //
    // ─── CACHED REQUESTS ──────────────────────────────────────────────────────────────────────
    //

    /**
     * When requesting offline, this method will permit to store a special request object to save wanted PUTs/POSTs/DELETEs.
     * @param type
     * @param request
     */
    storeRequest(request: StoredRequest) {
        let storedRequests: Array<StoredRequest> = [];

        this.get(AsyncacheService.PENDING_REQUESTS).subscribe(
            result => {
                if (!result) {
                    storedRequests = [];
                } else {
                    storedRequests = result;
                }
                storedRequests.push(request);
                this.set(AsyncacheService.PENDING_REQUESTS, storedRequests).subscribe();
            }
        );
    }

    useMethod(request: StoredRequest): Observable<any> {
        let httpMethod;

        if (request.method === 'PUT') {
            httpMethod = this.http.put(request.url, request.body, request.options);
        } else if (request.method === 'POST') {
            httpMethod = this.http.post(request.url, request.body, request.options);
        } else if (request.method === 'DELETE') {
            httpMethod = this.http.delete(request.url, request.options);
        } else {
            httpMethod = null;
        }

        return httpMethod.pipe(
            catchError(
                error => {
                    const failedRequest = new FailedRequest(request, error);
                    return of(failedRequest);
                }
            )
        );
    }

    //
    // ─── DISTRIBUTION BENEFICIARIES ──────────────────────────────────────────────────────────────────────
    //

    /**
     * Store beneficiaries in the caChe
     */
    storeBeneficiaries(project: Project, distribution: Distribution, beneficiaries: Array<any>): Observable<any> {
        const distributionBeneficiaries = distribution.get<Array<DistributionBeneficiary>>('distributionBeneficiaries')
            .map((distributionBeneficiary: DistributionBeneficiary) => distributionBeneficiary.modelToApi());
        return forkJoin(
            this.set(AsyncacheService.DISTRIBUTIONS + '_' + distribution.get('id') + '_beneficiaries', distributionBeneficiaries),
            this.set(AsyncacheService.PROJECTS + '_' + project.get('id') + '_beneficiaries', beneficiaries)
        ).pipe(
            map(_result => {
                return true;
            })
        );
    }

    checkForBeneficiaries(distribution: Distribution): Observable<boolean> {
        return this.get(AsyncacheService.DISTRIBUTIONS + '_' + distribution.get('id') + '_beneficiaries').pipe(
            map(result => {
                return result ? true : false;
            })
        );
    }
}
