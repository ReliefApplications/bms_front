import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { CacheService } from '../storage/cache.service';
import { NetworkService } from './network.service';


@Injectable({
    providedIn: 'root'
})
export class LocationService {
    readonly api = URL_BMS_API;

    constructor(
        private http: HttpService,
        private cacheService: CacheService,
        private networkService: NetworkService,
    ) {
    }

    /**
     * Get all adm1
     */
    public getAdm1() {
        let url = this.api + "/location/adm1";

        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.ADM1);
                
                if(cacheData) {
                    observer.next(cacheData);
                }

                if(this.networkService.getStatus()) {

                    let backData;

                    this.http.get(url).subscribe(
                        result => {

                            backData = result;

                            if(backData && backData !== cacheData) {
                                observer.next(backData);
                                this.cacheService.set(CacheService.ADM1, backData);
                            }
                            observer.complete();                            
                        }
                    )
                } else {
                    observer.complete();
                }
            }
        );

        return(data);
    }

    /**
     * Get all adm2 associate to the selected adm1
     * @param body 
     */
    public getAdm2(body?: any) {
        let url = this.api + "/location/adm2";
        
        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.ADM2);
                
                if(cacheData) {
                    observer.next(cacheData);
                }

                if(this.networkService.getStatus()) {

                    let backData;

                    this.http.get(url).subscribe(
                        result => {

                            backData = result;

                            if(backData && backData !== cacheData) {
                                observer.next(backData);
                                this.cacheService.set(CacheService.ADM2, backData);
                            }
                            observer.complete();                            
                        }
                    )
                } else {
                    observer.complete();
                }
            }
        );

        return(data);
    }

    /**
     * Get all adm3 associate to the selected adm2
     * @param body 
     */
    public getAdm3(body?: any) {
        let url = this.api + "/location/adm3";
        
        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.ADM3);
                
                if(cacheData) {
                    observer.next(cacheData);
                }

                if(this.networkService.getStatus()) {

                    let backData;

                    this.http.get(url).subscribe(
                        result => {

                            backData = result;

                            if(backData && backData !== cacheData) {
                                observer.next(backData);
                                this.cacheService.set(CacheService.ADM3, backData);
                            }
                            observer.complete();                            
                        }
                    )
                } else {
                    observer.complete();
                }
            }
        );

        return(data);
    }

    /**
     * Get all adm4 associate to the selected adm3
     * @param body 
     */
    public getAdm4(body?: any) {
        let url = this.api + "/location/adm4";
        
        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.ADM4);
                
                if(cacheData) {
                    observer.next(cacheData);
                }

                if(this.networkService.getStatus()) {

                    let backData;

                    this.http.get(url).subscribe(
                        result => {

                            backData = result;

                            if(backData && backData !== cacheData) {
                                observer.next(backData);
                                this.cacheService.set(CacheService.ADM4, backData);
                            }
                            observer.complete();                            
                        }
                    )
                } else {
                    observer.complete();
                }
            }
        );

        return(data);
    }

    public getUpcomingDistributionCode() {
        let url = this.api + "/location/upcoming_distribution";
        return this.http.get(url);
    }
}