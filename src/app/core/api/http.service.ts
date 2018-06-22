import { Injectable                                 } from '@angular/core';
import { Http, Headers, RequestOptions              } from '@angular/http';
import { Router                                     } from '@angular/router';

//Services
import { WsseService                                } from '../authentication/wsse.service';

@Injectable({
	providedIn: 'root'
})
export class HttpService {

    public lastRequestUri : string;

    constructor(
        private http : Http,
        private router : Router,
        private _wsseService : WsseService
    ){
    }

    /**
     * Build the uri from parameters
     * @param  {any}    parameters [description]
     * @return {[type]}            [description]
     */
    buildUri(parameters : any){
        let uri = Object.keys(parameters).length > 0 ? '?' : '';

        let keys = Object.keys(parameters);
        keys.forEach( (key, index) => {
            uri += key + '=' + encodeURIComponent(parameters[key]);

            if(index < (keys.length-1)){
                uri += '&';
            }
        });

        return uri;
    }

    prepareQuery(parameters = {}, headers = {}) : RequestOptions{

        let useXWsse = true;
        if( 'useXWsse' in parameters ) {
            useXWsse = parameters['useXWsse'];
            delete parameters['useXWsse'];
        }

        if( useXWsse )
            headers['x-wsse'] = this._wsseService.getHeaderValue();

        this.lastRequestUri = this.buildUri(parameters);

        let _headers = new Headers(headers);
        return new RequestOptions({headers: _headers});
    }

    get(url, parameters = {}, headers = {}){
        let options = this.prepareQuery(parameters, headers);
        url += this.lastRequestUri;

        return this.http.get(url , options);
    }

    post(url, body, parameters = {}, headers = {}){
        let options = this.prepareQuery(parameters, headers);
        url += this.lastRequestUri;
        return this.http.post(url, body, options);
    }

    put(url, body, parameters = {}, headers = {}){
        let options = this.prepareQuery(parameters, headers);
        url += this.lastRequestUri;

        return this.http.put(url, body, options);
    }

    delete(url, parameters = {}, headers = {}){
        let options = this.prepareQuery(parameters, headers);
        url += this.lastRequestUri;

        return this.http.delete(url, options);
    }

}
