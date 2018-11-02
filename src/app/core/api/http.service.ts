import { Injectable                                 } from '@angular/core';
import { RequestOptions                             } from '@angular/http';
import { HttpClient, HttpParams                     } from '@angular/common/http';
import { URL_BMS_API } from '../../../environments/environment';
import { Router                                     } from '@angular/router';

//Services
import { WsseService                                } from '../authentication/wsse.service';
import { Observable, concat } from 'rxjs';
import { AsyncacheService } from '../storage/asyncache.service';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class HttpService {

    constructor(
        private http : HttpClient,
        private cache: AsyncacheService,
        private router : Router,
        private _wsseService : WsseService
    ){
    }

    resolveItem(url :string) {
        if (url.includes(URL_BMS_API, 0)) {
            url = url.split(URL_BMS_API)[1];
            switch(url) {
                case '/projects' : return(AsyncacheService.PROJECTS)
                    break;
                case '/distributions' : return(AsyncacheService.DISTRIBUTIONS)
                    break;
                case '/beneficiaries' : return(AsyncacheService.HOUSEHOLDS)
                    break;
                // ...
                default: return(null);
            }
        } else {
            return(null);
        }
        
    }

    get(url, options = {}) : Observable<any> {
        let item = this.resolveItem(url);
        let cacheData : any;
        console.log('--', item);
        if(item) {
            return concat(
                this.cache.get(item).pipe(
                    map(
                        result => {
                            cacheData = result;
                            return(result);
                        }
                    )
                ), 
                this.http.get(url, options).pipe( 
                    map(
                        result => {
                            if( result && cacheData !== result) {
                                console.log(cacheData === result);
                                this.cache.set(item, result);
                            }
                            return(result);
                        }
                    )
                )
            );
        } else {
            return this.http.get(url, options);
        }
    }

    post(url, body, options = {}) : Observable<any> {
        return this.http.post(url, body, options);
    }

    put(url, body, options = {}) : Observable<any> {
        return this.http.put(url, body, options);
    }

    delete(url, options = {}) : Observable<any> {
        return this.http.delete(url, options);
    }

}
