import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Services
import { concat, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { StoredRequestInterface } from 'src/app/models/interfaces/stored-request';
import { URL_BMS_API } from '../../../environments/environment';
import { AsyncacheService } from '../storage/asyncache.service';
import { NetworkService } from './network.service';


@Injectable({
    providedIn: 'root'
})
export class HttpService {

    save = true;
    exist = false;

    constructor(
        private http: HttpClient,
        private cacheService: AsyncacheService,
        private networkService: NetworkService,
        private snackbar: SnackbarService,
    ) {
    }

    resolveItemKey(url: string) {
        this.save = true;

        if (url.includes(URL_BMS_API, 0)) {
            url = url.split(URL_BMS_API)[1];

            switch (url) {
                case '/login': return (AsyncacheService.USER);
                case '/projects': return (AsyncacheService.PROJECTS);
                case '/distributions': return (AsyncacheService.DISTRIBUTIONS);
                case '/location/upcoming_distribution': return (AsyncacheService.UPCOMING);
                case '/country_specifics': return (AsyncacheService.SPECIFICS);
                case '/web-users': return (AsyncacheService.USERS);
                case '/sectors': return (AsyncacheService.SECTORS);
                case '/donors': return (AsyncacheService.DONORS);
                case '/location/adm1': return (AsyncacheService.ADM1);
                case '/location/adm2': return (AsyncacheService.ADM2);
                case '/location/adm3': return (AsyncacheService.ADM3);
                case '/location/adm4': return (AsyncacheService.ADM4);
                case '/distributions/criteria': return (AsyncacheService.CRITERIAS);
                case '/modalities': return (AsyncacheService.MODALITIES);
                case '/vulnerability_criteria': return (AsyncacheService.VULNERABILITIES);
                case '/summary': return (AsyncacheService.SUMMARY);
                case '/households': return (AsyncacheService.HOUSEHOLDS);

                default:
                    if (url.substring(0, 24) === '/distributions/projects/') {
                        return (AsyncacheService.DISTRIBUTIONS + '_' + url.split('/distributions/projects/')[1]);
                    } else {
                        const regex = new RegExp(/\/distributions\/\d+\/beneficiaries/);
                        const regex2 = new RegExp(/\/transaction\/distribution\/\d+\/pickup/);

                        if (url.match(regex) && !this.networkService.getStatus()) {
                            this.save = false;
                            return (AsyncacheService.DISTRIBUTIONS + '_' + url.split('/')[2] + '_beneficiaries');
                        } else if (url.match(regex2) && !this.networkService.getStatus()) {
                            this.save = false;
                            this.exist = true;
                        } else {
                            return (null);
                        }
                    }
            }
        } else {
            return (null);
        }

    }

    filteredPendingRequests(url: string) {
        let filtered = false;

        if (url.includes(URL_BMS_API, 0)) {
            url = url.split(URL_BMS_API)[1];

            const regex =  new RegExp(/\/location\/adm/);

            if (url.substring(0, 11) === '/indicators' || url === '/households/get/all' || url.match(regex)) {
                filtered = true;
            }
        }

        return (filtered);
    }

    get(url, options = {}): Observable<any> {

        let itemKey = this.resolveItemKey(url);
        const connected = this.networkService.getStatus();
        let cacheData: any;
        const regexBenef = new RegExp(/\/distributions\/\d+\/beneficiaries/);
        const regexRandom = new RegExp(/\/distributions\/\d+\/random/);
        const urlSplitted = url.split('/')[5] + '/' + url.split('/')[6];
        const regex = new RegExp(/distributions\/\d+/);

        if (urlSplitted.match(regex)) {
            this.exist = true;
            itemKey = AsyncacheService.DISTRIBUTIONS + '_' + urlSplitted.split('/')[1] + '_beneficiaries';
        }
        // If this item is cachable & user is connected
        if (itemKey && connected) {
            return concat(
                this.cacheService.get(itemKey).pipe(
                    map(
                        result => {
                            if (url.match(regexBenef)) {
                                cacheData = result ? result.distribution_beneficiaries : null;
                                return result ? result.distribution_beneficiaries : null;
                            } else if (url.match(regexRandom)) {
                                cacheData = null;
                                return null;
                            } else {
                                cacheData = result;
                                return (result);
                            }
                        }
                    )
                ),
                this.http.get(url, options).pipe(
                    map(
                        result => {

                            if (result !== undefined) {
                                if (Array.isArray(result) && Array.isArray(cacheData)) {
                                    if (JSON.stringify(result) !== JSON.stringify(cacheData) && this.save) {
                                        if (!url.match(regexBenef) && !url.match(regexRandom)) {
                                            this.cacheService.set(itemKey, result).subscribe();
                                        }
                                    }
                                } else if (result !== cacheData && this.save) {
                                    if (!url.match(regexBenef) && !url.match(regexRandom)) {
                                        this.cacheService.set(itemKey, result).subscribe();
                                    }
                                }
                            }
                            return result;
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
                        if (url.match(regexBenef)) {
                            return result ? result.distribution_beneficiaries : null;
                        }  else if (url.match(regexRandom)) {
                            return null;
                        } else {
                            return (result);
                        }
                    }
                )
            );
        } else if (this.exist) {
            this.exist = false;
            return of([]);
        } else {
            this.snackbar.warning('This data can\'t be accessed offline');
            return of([]);
        }
    }

    put(url, body, options = {}): Observable<any> {
        const connected = this.networkService.getStatus();

        if (!connected) {
            if (!this.filteredPendingRequests(url)) {
                const date = new Date();
                const method = 'PUT';
                const request: StoredRequestInterface = { method, url, body, options, date };
                this.cacheService.storeRequest(request);
                this.snackbar.warning('No network - This data creation will be sent to DB on next connection');

                this.forceDataInCache(method, url, body);
            } else {
                this.snackbar.warning('No network connection to join DB');
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
            if (!this.filteredPendingRequests(url)) {
                const date = new Date();
                const method = 'POST';
                if (!urlSplitted.match(regex)) {
                    const request: StoredRequestInterface = { method, url, body, options, date };
                    this.cacheService.storeRequest(request);
                    this.snackbar.warning('No network - This data update will be sent to DB on next connection');
                }

                this.forceDataInCache(method, url, body);
            } else {
                this.snackbar.warning('No network connection to join DB');
            }

            return (of(null));
        } else {
            return this.http.post(url, body, options);
        }
    }

    delete(url, options = {}): Observable<any> {
        const connected = this.networkService.getStatus();

        if (!connected) {
            if (!this.filteredPendingRequests(url)) {
                const date = new Date();
                const method = 'DELETE';
                const request: StoredRequestInterface = { method, url, options, date };
                this.cacheService.storeRequest(request);
                this.snackbar.warning('No network - This data deletion will be sent to DB on next connection');

                this.forceDataInCache(method, url, {});
            } else {
                this.snackbar.warning('No network connection to join DB');
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
                object = body;
                itemKey = this.resolveItemKey(url);
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
                this.snackbar.warning('This item can\'t be manipulated offline');
            }
        }
    }
}
