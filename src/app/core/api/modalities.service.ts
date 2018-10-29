import { Injectable                                 } from '@angular/core';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';
import { Observable } from 'rxjs';
import { CacheService } from '../storage/cache.service';
import { NetworkService } from './network.service';

@Injectable({
	providedIn: 'root'
})
export class ModalitiesService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService,
        private cacheService: CacheService,
        private networkService: NetworkService,
    ){
    }

    public getModalities() {
        let url = this.api + "/modalities";

        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.MODALITIES);
                
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
                                this.cacheService.set(CacheService.MODALITIES, backData);
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

    public getModalitiesType(modalities_id: string) {
        let url = this.api + "/modalities/"+modalities_id+"/types";
        return this.http.get(url);
    }
}