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

    get(url, options = {}) : Observable<any> {
        return this.http.get(url , options);
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
