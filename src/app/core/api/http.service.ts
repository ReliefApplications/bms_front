import { Injectable                                 } from '@angular/core';
import { Http, Headers, RequestOptions              } from '@angular/http';
import {HttpClient, HttpParams                                  } from "@angular/common/http";
import { Router                                     } from '@angular/router';

//Services
import { WsseService                                } from '../authentication/wsse.service';
import { forEach } from '@angular/router/src/utils/collection';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class HttpService {

    public lastRequestUri : HttpParams;

    constructor(
        private http : HttpClient,
        private router : Router,
        private _wsseService : WsseService
    ){
    }

    /**
     * Build the uri from parameters
     * @param  {any}    parameters [description]
     * @return {[type]}            [description]
     */
    buildUri(parameters : any) {

        let params = new HttpParams();

        for (let i = 0; i < parameters.length; i++) {
            
            params = params.set( String(Object.keys(parameters)[i]), String(parameters[i]) );
            
        }

        // new Map (parameters)
        // .forEach(
        //     (value, key, map) => {
        //         params = params.set(String(key), String(value));
        //     }
        // );

        return(params);
    }

    prepareQuery(parameters = {}) : any {

        this.lastRequestUri = this.buildUri(parameters);

        return new RequestOptions();
    }

    get(url, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        url += this.lastRequestUri;

        return this.http.get(url , options);
    }

    post(url, body, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        url += this.lastRequestUri;
        return this.http.post(url, body, options);
    }

    put(url, body, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        url += this.lastRequestUri;

        return this.http.put(url, body, options);
    }

    delete(url, parameters = {}) : Observable<any> {
        let options = this.prepareQuery(parameters);
        url += this.lastRequestUri;

        return this.http.delete(url, options);
    }

}
