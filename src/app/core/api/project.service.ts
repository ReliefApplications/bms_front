import { Injectable } from '@angular/core';

import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { CacheService } from '../storage/cache.service';
import { of, Observable, merge, fromEvent } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { NetworkService } from './network.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    
    readonly api = URL_BMS_API;
    online$ : Observable<boolean>;

    constructor(
        private http: HttpService,
        private cacheService : CacheService,
        private networkService : NetworkService
    ) {
    }

    public test() {

        
    }

    public get() {

        let url = this.api + "/projects";

        let data = new Observable(
            (observer) => {

                let cacheData = this.cacheService.get(CacheService.PROJECTS);
                
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
                                this.cacheService.set(CacheService.PROJECTS, backData);
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
        let url = this.api + "/projects/" + id;
        return this.http.post(url, body);
    }

    public create(id: number, body: any) {
        let url = this.api + "/projects";
        return this.http.put(url, body);
    }

    public delete(id: number, body: any) {
        let url = this.api + "/projects/" + id;
        return this.http.delete(url, body);
    }

    public addBeneficiaries(projectId: number, filter: any) {
        let url = this.api + "/projects/" + projectId + "/beneficiaries/add";
        let body = {
            filter: filter
        }
        return this.http.post(url, body);
    }
}
