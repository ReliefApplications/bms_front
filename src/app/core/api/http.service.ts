import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_BMS_API } from '../../../environments/environment';

//Services
import { Observable, concat, of, merge, timer } from 'rxjs';
import { AsyncacheService } from '../storage/asyncache.service';
import { map } from 'rxjs/operators';
import { NetworkService } from './network.service';
import { MatSnackBar } from '@angular/material';
import { StoredRequestInterface } from 'src/app/model/stored-request';
import { element } from '@angular/core/src/render3/instructions';
import { keyframes } from '@angular/animations';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    save: boolean = true;
    exist: boolean = false;

    constructor(
        private http: HttpClient,
        private cacheService: AsyncacheService,
        private networkService: NetworkService,
        private snackbar: MatSnackBar,
    ) {
    }

    resolveItemKey(url: string) {
        this.save = true;

        if (url.includes(URL_BMS_API, 0)) {
            url = url.split(URL_BMS_API)[1];

            switch (url) {
                case '/login': return (AsyncacheService.USER)
                case '/projects': return (AsyncacheService.PROJECTS)
                case '/distributions': return (AsyncacheService.DISTRIBUTIONS)
                case '/location/upcoming_distribution': return (AsyncacheService.UPCOMING)
                case '/country_specifics': return (AsyncacheService.SPECIFICS)
                case '/web-users': return (AsyncacheService.USERS)
                case '/sectors': return (AsyncacheService.SECTORS)
                case '/donors': return (AsyncacheService.DONORS)
                case '/location/adm1': return (AsyncacheService.ADM1)
                case '/location/adm2': return (AsyncacheService.ADM2)
                case '/location/adm3': return (AsyncacheService.ADM3)
                case '/location/adm4': return (AsyncacheService.ADM4)
                case '/distributions/criteria': return (AsyncacheService.CRITERIAS)
                case '/modalities': return (AsyncacheService.MODALITIES)
                case '/vulnerability_criteria': return (AsyncacheService.VULNERABILITIES)
                case '/summary': return (AsyncacheService.SUMMARY)
                case '/households': return (AsyncacheService.HOUSEHOLDS)
                default:
                    if (url.substring(0, 24) === '/distributions/projects/')
                        return (AsyncacheService.DISTRIBUTIONS + '_' + url.split('/distributions/projects/')[1]);
                    else {
                        const regex = new RegExp(/\/distributions\/\d+\/beneficiaries/);
                        const regex2 = new RegExp(/\/transaction\/distribution\/\d+\/pickup/);

                        if (url.match(regex) && !this.networkService.getStatus()) {
                            this.save = false;
                            return (AsyncacheService.DISTRIBUTIONS + '_' + url.split('/')[2] + '_beneficiaries');
                        }
                        else if (url.match(regex2) && !this.networkService.getStatus()) {
                            this.save = false;
                            this.exist = true;
                        }
                        else {
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

            if (url.substring(0, 11) === '/indicators' || url === '/households/get/all') {
                filtered = true;
            }
        }

        return (filtered);
    }

    get(url, options = {}): Observable<any> {

        let itemKey = this.resolveItemKey(url);
        let connected = this.networkService.getStatus();
        let cacheData: any;

        let urlSplitted = url.split('/')[5] + '/' + url.split('/')[6];
        const regex = new RegExp(/distributions\/\d+/);

        if (urlSplitted.match(regex)) {
            this.exist = true;
            this.cacheService.get(AsyncacheService.DISTRIBUTIONS + "_" + urlSplitted.split('/')[1] + "_beneficiaries").subscribe(
                result => {
                    if (result) {
                        itemKey = AsyncacheService.DISTRIBUTIONS + "_" + urlSplitted.split('/')[1] + "_beneficiaries";
                    }
                }
            );
        }
        // Test logs
        //console.log('--', itemKey, '--');
        // If this item is cachable & user is connected
        if (itemKey && connected) {
            return concat(
                this.cacheService.get(itemKey).pipe(
                    map(
                        result => {
                            cacheData = result;
                            return (result);
                        }
                    )
                ),
                this.http.get(url, options).pipe(
                    map(
                        result => {
                            if (result !== undefined) {
                                if (Array.isArray(result) && Array.isArray(cacheData)) {
                                    if (JSON.stringify(result) !== JSON.stringify(cacheData) && this.save)
                                        this.cacheService.set(itemKey, result);
                                } else if (result !== cacheData && this.save) {
                                    this.cacheService.set(itemKey, result);
                                }
                            }
                            return (result);
                        }
                    )
                )
            );
        }
        // If user is connected but cache doesn't manage this item
        else if (connected) {
            return this.http.get(url, options);
        }
        // If user offline but this item can be accessed from the cache
        else if (itemKey) {
            return this.cacheService.get(itemKey);
        }
        // If disconnected and item uncachable
        else if (this.exist) {
            this.exist = false;
            return of([]);
        }
        else {
            this.snackbar.open('This data can\'t be accessed offline', '', { duration: 3000, horizontalPosition: 'center' });
            return of([]);
        }
    }

    put(url, body, options = {}): Observable<any> {
        let connected = this.networkService.getStatus();

        if (!connected) {
            if (!this.filteredPendingRequests(url)) {
                let date = new Date();
                let method = "PUT";
                let request: StoredRequestInterface = { method, url, body, options, date };
                this.cacheService.storeRequest(request);
                this.snackbar.open('No network - This data creation will be sent to DB on next connection', '', { duration: 3000, horizontalPosition: 'center' });

                this.forceDataInCache(method, url, body);
            }
            // Otherwise
            else {
                this.snackbar.open('No network connection to join DB', '', { duration: 3000, horizontalPosition: 'center' });
            }

            return (of(null));
        }
        else {
            return this.http.put(url, body, options);
        }
    }

    post(url, body, options = {}): Observable<any> {
        let connected = this.networkService.getStatus();
        let urlSplitted = url.split('/')[5] + '/' + url.split('/')[6] + "/" + url.split('/')[7] + "/" + url.split('/')[8];
        const regex = new RegExp(/distributions\/beneficiaries\/project\/\d+/);

        if (!connected) {
            if (!this.filteredPendingRequests(url)) {
                let date = new Date();
                let method = "POST";
                if (!urlSplitted.match(regex)) {
                    let request: StoredRequestInterface = { method, url, body, options, date };
                    this.cacheService.storeRequest(request);
                    this.snackbar.open('No network - This data update will be sent to DB on next connection', '', { duration: 3000, horizontalPosition: 'center' });
                }

                this.forceDataInCache(method, url, body);
            }
            // Otherwise
            else {
                this.snackbar.open('No network connection to join DB', '', { duration: 3000, horizontalPosition: 'center' });
            }

            return (of(null));
        }
        else {
            return this.http.post(url, body, options);
        }
    }

    delete(url, options = {}): Observable<any> {
        let connected = this.networkService.getStatus();

        if (!connected) {
            if (!this.filteredPendingRequests(url)) {
                let date = new Date();
                let method = "DELETE";
                let request: StoredRequestInterface = { method, url, options, date };
                this.cacheService.storeRequest(request);
                this.snackbar.open('No network - This data deletion will be sent to DB on next connection', '', { duration: 3000, horizontalPosition: 'center' });

                this.forceDataInCache(method, url, {});
            }
            // Otherwise
            else {
                this.snackbar.open('No network connection to join DB', '', { duration: 3000, horizontalPosition: 'center' });
            }

            return (of(null));
        }
        else {
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
                //console.log(url);
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
                    if (method === "PUT" && object) {
                        if (result) {
                            dataArray = result;
                        }
                        object['id'] = -1;
                        if (dataArray) {
                            dataArray.forEach(
                                element => {
                                    if (element['id'] && element['id'] <= object['id']) {
                                        object['id'] = element['id'] - 1;
                                    }
                                }
                            );
                        }
                        dataArray.push(object);
                    } else if (method === "POST" && object) {
                        dataArray = result;
                        //console.log('searching id: ', id);
                        dataArray.forEach(
                            (item, index) => {
                                //console.log('found: ', item);
                                if (item && item['id'] && item['id'] === id) {
                                    //console.log('got');
                                    dataArray[index] = body;
                                }
                            }
                        )
                    } else if (method === "DELETE") {
                        dataArray = result;
                        dataArray.forEach(
                            (item, index) => {
                                if (item && item['id'] && item['id'] === id) {
                                    dataArray.splice(index, 1);
                                }
                            }
                        )
                    } else {
                        dataArray = [];
                    }

                    //console.log('updating ', itemKey, 'to : ', dataArray);
                    if (this.save)
                        this.cacheService.set(itemKey, dataArray);
                }
            );

        } else {
            const urlSplitted = url.split('/');
            let postBeneficiariesDistribution = urlSplitted[5] + '/' + urlSplitted[6] + "/" + urlSplitted[7] + "/" + urlSplitted[8];
            const regex = new RegExp(/distributions\/beneficiaries\/project\/\d+/);

            let putBeneficiariesDistribution = urlSplitted[5] + '/' + urlSplitted[6] + "/" + urlSplitted[7];
            const regex2 = new RegExp(/distributions\/\d+\/beneficiary/);

            if (!postBeneficiariesDistribution.match(regex) && !putBeneficiariesDistribution.match(regex2)) {
                this.snackbar.open('This item can\'t be manipulated offline', '', { duration: 3000, horizontalPosition: 'center' });
            }
        }
    }
}
