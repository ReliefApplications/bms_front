import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';
import { CacheService } from '../storage/cache.service';
import { NetworkService } from './network.service';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class DonorService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService,
        private cacheService: CacheService,
        private networkService: NetworkService,
    ){
    }

    public get() {
        let url = this.api + "/donors";

        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.DONORS);
                
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
                                this.cacheService.set(CacheService.DONORS, backData);
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
        let url = this.api + "/donors/"+id;
        return this.http.post(url, body);
    }

    public create(id: number, body: any) {
        let url = this.api + "/donors";
        return this.http.put(url, body);
    }

    public delete(id: number) {
        let url = this.api + "/donors/"+id;
        return this.http.delete(url);
    }
}
