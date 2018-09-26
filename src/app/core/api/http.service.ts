import { Injectable                                 } from '@angular/core';
import { RequestOptions                             } from '@angular/http';
import { HttpClient, HttpParams                     } from '@angular/common/http';
import { Router                                     } from '@angular/router';

//Services
import { WsseService                                } from '../authentication/wsse.service';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class HttpService {

    constructor(
        private http : HttpClient,
        private router : Router,
        private _wsseService : WsseService
    ){
    }

    /**
     * Build the request parameters
     * @param  {any}    parameters
     * @return {any}
     */
    prepareQuery(parameters = {}) : any {
        return { params: parameters };
    }

    get(url, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        return this.http.get(url , options);
    }

    post(url, body, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        console.log(options)
        return this.http.post(url, body, options);
    }

    put(url, body, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        return this.http.put(url, body, options);
    }

    delete(url, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        return this.http.delete(url, options);
    }

}
