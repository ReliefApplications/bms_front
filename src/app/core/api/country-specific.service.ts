import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';
import { NetworkService } from './network.service';
import { CacheService } from '../storage/cache.service';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class CountrySpecificService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService,
        private cacheService: CacheService,
        private networkService: NetworkService,
    ){
    }

    public get() {
        let url = this.api + "/country_specifics";

        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.SPECIFICS);
                
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
                                this.cacheService.set(CacheService.SPECIFICS, backData);
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

    public update(id: number, body: any) {
        let url = this.api + "/country_specifics/"+id;
        return this.http.post(url, body);
    }

    public create(id: number, body: any) {
        let url = this.api + "/country_specifics";
        return this.http.put(url, body);
    }

    public delete(id: number, body: any) {
        let url = this.api + "/country_specifics/"+id;
        return this.http.delete(url, body);
    }
}