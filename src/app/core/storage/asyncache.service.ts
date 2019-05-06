import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, concat, map, switchMap, tap } from 'rxjs/operators';
import { Country } from 'src/app/model/country';
import { FailedRequestInterface, StoredRequestInterface } from 'src/app/model/stored-request';
import { User } from 'src/app/model/user';
import { Language } from 'src/texts/language';
import { CountriesService } from '../countries/countries.service';
import { LanguageService } from './../../../texts/language.service';
import { CachedItemInterface } from './cached-item.interface';

@Injectable({
    providedIn: 'root'
})
export class AsyncacheService implements OnInit {
    //  Country
    static actual_country;

    // Request storing
    static pendingRequests = false;

    // Keys
    static readonly USER = 'user';
    static readonly USERS = 'users';
    static readonly DISTRIBUTIONS = 'distributions';
    static readonly UPCOMING = 'upcoming';
    static readonly DONORS = 'donors';
    static readonly PROJECTS = 'projects';
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

    private storage: any;

    // Constants
    readonly PREFIX = 'bms';
    readonly SECTIMEOUT = 2592000; // 30 day in seconds
    readonly MSTIMEOUT = this.SECTIMEOUT * 1000;

    constructor(
        private languageService: LanguageService,
        private countriesService: CountriesService,
        protected localStorage: LocalStorage,
        protected http: HttpClient,
    ) {
        this.storage = localStorage;
    }

    ngOnInit() {
        this.get(AsyncacheService.COUNTRY).subscribe(
            result => {
                AsyncacheService.actual_country = result;
            }
        );
    }

    formatKey(key: string): string {
        if (key === AsyncacheService.COUNTRY || key === AsyncacheService.USER || key === AsyncacheService.USERS
            || key === AsyncacheService.PENDING_REQUESTS || key === AsyncacheService.LANGUAGE) {
            return this.PREFIX + '_' + key;
        } else {
            return this.PREFIX + '_' + AsyncacheService.actual_country + '_' + key;
        }
    }

    /**
     * Get an item from the cache asynchronously.
     * @param key
     */
    get(key: string) {
        key = this.formatKey(key);

        if (key === this.formatKey(AsyncacheService.DISTRIBUTIONS)) {
            return this.getAllDistributions().pipe(
                map(
                    (result) => {
                        if (result) {
                            return result;
                        }
                    }
                )
            );
        } else {
            return (
                this.storage.getItem(key).pipe(
                    map(
                        (result: CachedItemInterface) => {
                            if (result && result.storageTime + result.limit < (new Date).getTime()) {
                                if (result.canBeDeleted) {
                                    this.remove(key);
                                }
                                return null;
                            } else if (result) {
                                return result.value;
                            } else {
                                return null;
                            }
                        }
                    )
                )
            );
        }
    }

    /**
     * Gets the list of distributions for each project in the cache and adds it in an observable array asynchronously.
     */
    getAllDistributions() {
        const allDistributions = new Array();

        return new Observable(
            (observer) => {
                this.get(AsyncacheService.PROJECTS).subscribe(
                    result => {
                        if (result) {
                            result.forEach(
                                (project, index) => {
                                    this.get(AsyncacheService.DISTRIBUTIONS + '_' + project.id).subscribe(
                                        distributions => {
                                            if (distributions && distributions.length > 0) {
                                                distributions.forEach(
                                                    distrib => {
                                                        allDistributions.push(distrib);
                                                    }
                                                );
                                            }
                                            if (index === result.length - 1) {
                                                observer.next(allDistributions);
                                                observer.complete();
                                            }
                                        }
                                    );
                                }
                            );
                        } else {
                            observer.next(null);
                            observer.complete();
                        }
                    },
                    error => {
                        observer.next(null);
                        observer.complete();
                    }
                );
            }
        );
    }

    setLanguage(language: Language) {
        this.set(AsyncacheService.LANGUAGE, this.languageService.languageToString(language));
    }

    // Get and delete language from cache
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

    setCountry(country: Country): Observable<boolean> {
        return this.newSet(AsyncacheService.COUNTRY, country.get<string>('id'));
    }

    getCountry(): Observable<Country> {
        // countries are stored in user object TODO: don't
        const countries: Array<Country> = this.countriesService.enabledCountries;

        return this.get(AsyncacheService.COUNTRY).pipe(
            map((countryId: string) => {
               for (const country of countries) {
                    if (country.get<string>('id') === countryId) {
                        return country;
                    }
                }
                return undefined;
            })
        );
    }

    /**
     * Waits for asynchronous user value to return it synchronously.
    */
    getUser(): Observable<User> {
        return this.get(AsyncacheService.USER).pipe(
            map((cachedUser: object) => {
                    if (!cachedUser) {
                        // TODO: remove this case
                        return undefined;
                    } else {
                        return User.apiToModel(cachedUser);
                    }
                }
            )
        );
    }

   setUser(user: User): Observable<boolean> {
        return this.newSet(AsyncacheService.USER, user.modelToApi());
    }

    /**
     * Set an item in the cache
     * DEPRECATED
     * TODO: remove this
     * @param key
     * @param value
     * @param options
     *
     */
    set(key: string, value: any, options: any = {}) {
        key = this.formatKey(key);
        // this.localStorage.setItemSubscribe(key, value);
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
        this.localStorage.setItem(key, object).subscribe();

        if (key === this.formatKey(AsyncacheService.COUNTRY)) {
            AsyncacheService.actual_country = value;
        }
    }

    /**
     * Observable version of set
     * @param key
     * @param value
     * @param options
     */
    newSet(key: string, value: any, options: any = {}): Observable<boolean> {
        key = this.formatKey(key);
        // this.localStorage.setItemSubscribe(key, value);
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
        return this.localStorage.setItem(key, object).pipe(
            tap((_: any) => {
                if (key === this.formatKey(AsyncacheService.COUNTRY)) {
                    AsyncacheService.actual_country = value;
                }
            })
        );
    }

    /**
     * Removes an item with its key.
     * @param key
     */
    remove(key: string) {
        key = this.formatKey(key);
        this.storage.removeItemSubscribe(key);
    }

    /**
     * When requesting offline, this method will permit to store a special request object to save wanted PUTs/POSTs/DELETEs.
     * @param type
     * @param request
     */
    storeRequest(request: StoredRequestInterface) {
        let storedRequests: Array<StoredRequestInterface> = [];

        this.get(AsyncacheService.PENDING_REQUESTS).subscribe(
            result => {
                if (!result) {
                    storedRequests = [];
                } else {
                    storedRequests = result;
                }
                storedRequests.push(request);
                this.set(AsyncacheService.PENDING_REQUESTS, storedRequests);
            }
        );
    }

    /**
     * To send all the stored requests when online.
     */
    sendAllStoredRequests() {
        // TODO : update with new data structure
        return this.get(AsyncacheService.PENDING_REQUESTS).pipe(
            map(
                (requests: Array<any>) => {
                    if (requests) {
                        let totalObs: Observable<any>;
                        requests.forEach(
                            (request: StoredRequestInterface) => {
                                let method: Observable<any>;

                                method = this.useMethod(request)
                                    .pipe(
                                        catchError(
                                            error => {
                                                const failedRequest: FailedRequestInterface = {
                                                    fail: true,
                                                    request: request,
                                                    error: error,
                                                };
                                                return of(failedRequest);
                                            }
                                        )
                                    );
                                if (method) {
                                    if (!totalObs) {
                                        totalObs = method;
                                    } else {
                                        totalObs = totalObs.pipe(
                                            concat(method)
                                        );
                                    }
                                }
                            }
                        );
                        return totalObs;
                    } else {
                        return of(null);
                    }
                }
            )
        );
    }

    useMethod(request: StoredRequestInterface) {
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

        return httpMethod;
    }

    /**
     * Clear all the cache.
     * @param force - `true` to clear all the cache, `false` to exclude some fields
     * @param excludedFields - fields to keep after the clear
     */
    clear(force: boolean = true, excludedFields?: string[]) {
        // If force is true, clear all the storage
        if (force) {
            return this.storage.clear();
        } else {
            /** Object that will contain the fields that should remain in the storage and their value */
            const keptFields = {};
            /** Array of `storage.getItem` observables that will be subscribed to get the values of the fields we want to keep */
            const observables = [];
            // Push all the observables in the array
            for (const field of excludedFields) {
                observables.push(this.storage.getItem(this.formatKey(field)));
            }

            /**
             * Subscribe in parallel to all the observables of the `observables` array
             * and store the results in the `keptFields` object
             */
            return forkJoin(...observables)
                .pipe(
                    map(results => {
                        for (let i = 0; i < results.length; i++) {
                            keptFields[this.formatKey(excludedFields[i])] = results[i];
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

    autoClear(force: boolean = true) {
        if (force) {
            this.storage.clearSubscribe();
        } else {
            // TODO: find optimal code to adapt database clearing with deletable test.
        }
    }

    /**
     * Store beneficiaries in the cashe
     */
    storeBeneficiaries(project: any, distribution: any, beneficiaries: any): Observable<any> {

        return new Observable(observer => {
            let projectBenef;

            // const idDistribution = distribution.id;

            // this.get(AsyncacheService.DISTRIBUTIONS + "_" + project.id).subscribe(result => {
            //     if (result) {
            //         result.forEach(key => {
            //             if (key.id === idDistribution) {
                            // if (!allDistributions) {
                            //     let tmpArray = [];
                            //     tmpArray[0] = [];
                            //     tmpArray[1] = distribution;

                            //     allDistributions = tmpArray;
                            // }
                            // else {
                            //     let find: boolean = false;
                            //     allDistributions[0] = [];
                            //     allDistributions.find(element => {
                            //         if (element.id === idDistribution) {
                            //             find = true;
                            //             element = distribution;
                            //         }
                            //     });

                            //     if (!find)
                            //         allDistributions.push(distribution);
                            // }

                            projectBenef = beneficiaries;

                            this.set(AsyncacheService.DISTRIBUTIONS + '_' + distribution.id + '_beneficiaries', distribution);
                            this.set(AsyncacheService.PROJECTS + '_' + project.id + '_beneficiaries', projectBenef);

                            observer.next(true);
                            observer.complete();
                        // }
                        // else {
                        //     observer.error(true);
                        //     observer.complete();
                        // }
                        // Pas de distribution dans le cache, revenir sur la page project et réessayer
            //         });
            //     }

            // });
        });
    }

    checkForBeneficiaries(distribution): Observable<boolean> {
        return this.get(AsyncacheService.DISTRIBUTIONS + '_' + distribution.id + '_beneficiaries').pipe(
            map(distrib => {
                return distrib ? true : false;
            })
        );
    }
}
