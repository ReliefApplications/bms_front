import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Services
import { concat, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { StoredRequest } from 'src/app/models/interfaces/stored-request';
import { URL_BMS_API } from '../../../environments/environment';
import { AsyncacheService } from '../storage/asyncache.service';
import { NetworkService } from './network.service';
import { LanguageService } from 'src/app/core/language/language.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    save = true;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        private http: HttpClient,
        private cacheService: AsyncacheService,
        private networkService: NetworkService,
        private snackbar: SnackbarService,
        protected languageService: LanguageService,
    ) {
    }

    resolveItemKey(url: string) {
        this.save = true;

        if (url.includes(URL_BMS_API, 0)) {
            url = url.split(URL_BMS_API)[1];

            switch (true) {
                case url === '/login':
                    return AsyncacheService.USER;
                case url === '/projects':
                    return AsyncacheService.PROJECTS;
                case url === '/distributions':
                    return AsyncacheService.DISTRIBUTIONS;
                case url === '/location/upcoming_distribution':
                    return AsyncacheService.UPCOMING;
                case url === '/country_specifics':
                    return AsyncacheService.SPECIFICS;
                case url === '/web-users':
                    return AsyncacheService.USERS;
                case url === '/sectors':
                    return AsyncacheService.SECTORS;
                case url === '/donors':
                    return AsyncacheService.DONORS;
                case url === '/location/adm1':
                    return AsyncacheService.ADM1;
                case url === '/location/adm2':
                    return AsyncacheService.ADM2;
                case url === '/location/adm3':
                    return AsyncacheService.ADM3;
                case url === '/location/adm4':
                    return AsyncacheService.ADM4;
                case url === '/distributions/criteria':
                    return AsyncacheService.CRITERIAS;
                case url === '/modalities':
                    return AsyncacheService.MODALITIES;
                case url === '/vulnerability_criteria':
                    return AsyncacheService.VULNERABILITIES;
                case url === '/summary':
                    return AsyncacheService.SUMMARY;
                case url === '/households':
                    return AsyncacheService.HOUSEHOLDS;
                case url.substring(0, 24) === '/distributions/projects/':
                    return AsyncacheService.DISTRIBUTION_PROJECT + '_' + url.split('/distributions/projects/')[1];
                case /\/distributions\/\d+\/beneficiaries/.test(url):
                    this.save = false;
                    return AsyncacheService.DISTRIBUTIONS + '_' + url.split('/')[2] + '_beneficiaries';
                case /\/distributions\/\d+$/.test(url):
                    return AsyncacheService.DISTRIBUTIONS + '_' + url.split('/')[2];
                default:
                    return null;
            }
        } else {
            return null;
        }

    }

    canBeOfflineRequest(url: string) {
        let filtered = true;
        if (url.includes(URL_BMS_API, 0)) {
            url = url.split(URL_BMS_API)[1];
            const regex = new RegExp(/\/location\/adm/);
            if (url.substring(0, 11) === '/indicators' || url === '/households/get/all' || url.match(regex)) {
                filtered = false;
            }
        }
        return filtered;
    }

    get(url: string, options = {}): Observable<any> {

        const itemKey = this.resolveItemKey(url);
        const connected = this.networkService.getStatus();
        let cacheData: any;
        const regex = new RegExp(/\/location\/adm/);


        // If this item is cachable & user is connected
        if (itemKey && connected) {
            return concat(
                this.cacheService.get(itemKey).pipe(
                    map(
                        (result: any) => {

                            cacheData = result;
                            return result;
                        }
                    )
                ),
                this.http.get(url, options).pipe(
                    map(
                        (result: any) => {
                            if (result !== undefined) {
                                if (Array.isArray(result) && Array.isArray(cacheData)) {
                                    if (JSON.stringify(result) !== JSON.stringify(cacheData) && this.save) {
                                        this.cacheService.set(itemKey, result).subscribe();
                                    }
                                } else if (result !== cacheData && this.save) {
                                    this.cacheService.set(itemKey, result).subscribe();
                                }
                            }

                            // If it is an adm fetch and the results are the same, we don't return it
                            // TO DO : do it for every request but it will return null so test if (response) everywhere
                            if ((Array.isArray(result) && Array.isArray(cacheData) && JSON.stringify(result) !== JSON.stringify(cacheData))
                                || !url.match(regex) || (!(Array.isArray(result) && Array.isArray(cacheData)) && result !== cacheData)) {
                                return result;
                            }
                        }
                    )
                )
            );
        } else if (connected) {
            return this.http.get(url, options);
        } else if (itemKey) {
            return this.cacheService.get(itemKey).pipe(
                map(
                    result => {
                        return result;
                    }
                )
            );
        } else {
            this.snackbar.warning(this.language.network_access_offline + ' ' + url);
            return of([]);
        }
    }

    put(url, body, options = {}): Observable<any> {
        const connected = this.networkService.getStatus();

        if (!connected) {
            if (this.canBeOfflineRequest(url)) {
                const date = new Date();
                const method = 'PUT';
                const request = new StoredRequest(method, url, options, date, body);
                this.cacheService.storeRequest(request);
                this.snackbar.warning(this.language.network_no_connection_reconnect);

                this.forceDataInCache(method, url, body);
            } else {
                this.snackbar.warning(this.language.network_no_connection);
            }

            return (of(null));
        } else {
            return this.http.put(url, body, options);
        }
    }

    post(url, body, options = {}): Observable<any> {
        const connected = this.networkService.getStatus();
        const urlSplitted = url.split('/').slice(5, 9).join('/');
        const regex = new RegExp(/distributions\/beneficiaries\/project\/\d+/);

        if (!connected) {
            if (this.canBeOfflineRequest(url)) {
                const date = new Date();
                const method = 'POST';
                if (!urlSplitted.match(regex)) {
                    const request = new StoredRequest(method, url, options, date, body);
                    this.cacheService.storeRequest(request);
                    this.snackbar.warning(this.language.network_no_connection_reconnect);
                }

                this.forceDataInCache(method, url, body);
            } else {
                this.snackbar.warning(this.language.network_no_connection);
            }

            return (of(null));
        } else {
            return this.http.post(url, body, options);
        }
    }

    delete(url, options = {}): Observable<any> {
        const connected = this.networkService.getStatus();

        if (!connected) {
            if (this.canBeOfflineRequest(url)) {
                const date = new Date();
                const method = 'DELETE';
                const request = new StoredRequest(method, url, options, date);
                this.cacheService.storeRequest(request);
                this.snackbar.warning(this.language.network_no_connection_reconnect);

                this.forceDataInCache(method, url, {});
            } else {
                this.snackbar.warning(this.language.network_no_connection);
            }

            return (of(null));
        } else {
            return this.http.delete(url, options);
        }
    }

    forceDataInCache(method, url, body?) {
        let itemKey: string;
        let object = {};
        let id;

        switch (method) {
            case 'PUT':
                itemKey = this.resolveItemKey(url);
                object = body;
                id = -1;
                break;
            case 'POST':
                object = body;
                itemKey = this.resolveItemKey(url.substring(0, url.lastIndexOf('/')));
                id = Number(url.substring(url.lastIndexOf('/') + 1));
                break;
            case 'DELETE':
                itemKey = this.resolveItemKey(url.substring(0, url.lastIndexOf('/')));
                id = Number(url.substring(url.lastIndexOf('/') + 1));
                break;
            default:
                itemKey = this.resolveItemKey(url);
                break;
        }

        if (itemKey) {
            let dataArray = [];

            this.cacheService.get(itemKey).subscribe(
                result => {
                    if (method === 'PUT' && object) {
                        if (result) {
                            dataArray = result;
                        }
                        object['id'] = -1;
                        if (dataArray) {
                            dataArray.forEach(
                                data => {
                                    if (data['id'] && data['id'] <= object['id']) {
                                        object['id'] = data['id'] - 1;
                                    }
                                }
                            );
                        }
                        dataArray.push(object);
                    } else if (method === 'POST' && object) {
                        dataArray = result;
                        dataArray.forEach(
                            (item, index) => {
                                if (item && item['id'] && item['id'] === id) {
                                    dataArray[index] = body;
                                }
                            }
                        );
                    } else if (method === 'DELETE') {
                        dataArray = result;
                        dataArray.forEach(
                            (item, index) => {
                                if (item && item['id'] && item['id'] === id) {
                                    dataArray.splice(index, 1);
                                }
                            }
                        );
                    } else {
                        dataArray = [];
                    }

                    if (this.save) {
                        this.cacheService.set(itemKey, dataArray).subscribe();
                    }
                }
            );

        } else {
            let match = false;
            const formattedUrl: string = url.split('/').slice(5, 10).join('/');
            const regex = [];

            regex.push(new RegExp(/distributions\/beneficiaries\/project\/\d+/));
            regex.push(new RegExp(/distributions\/\d+\/beneficiary/));
            regex.push(new RegExp(/distributions\/generalrelief.*/));

            regex.forEach(re => {
                if (formattedUrl.match(re)) {
                    match = true;
                    return;
                }
            });

            if (!match) {
                this.snackbar.warning(this.language.network_manipulate_offline + ' ' + url);
            }
        }
    }
}
