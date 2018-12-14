import { Injectable }                   from '@angular/core';
import { LocalStorage }                 from '@ngx-pwa/local-storage';
import { CachedItemInterface }          from './cached-item.interface';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from 'src/app/model/user';
import { HttpClient } from '@angular/common/http';
import { StoredRequestInterface } from 'src/app/model/stored-request';
import { SSL_OP_CISCO_ANYCONNECT } from 'constants';
import { HttpMethod } from 'blocking-proxy/built/lib/webdriver_commands';

@Injectable({
	providedIn: 'root'
})
export class AsyncacheService {

    private storage : any;

    // Constants
    readonly PREFIX                             = 'bms';
    readonly SECTIMEOUT 						= 2592000; // 30 day in seconds
    readonly MSTIMEOUT                          = this.SECTIMEOUT*1000;

    //  Country
    static actual_country;

    // Request storing
    static pendingRequests: boolean = false;

    // Keys
    static readonly USER 						= 'user';
	static readonly USERS 						= 'users';    
    static readonly DISTRIBUTIONS              	= 'distributions';
    static readonly UPCOMING                    = 'upcoming';
	static readonly DONORS		              	= 'donors';
	static readonly PROJECTS		            = 'projects';
	static readonly SECTORS		              	= 'sectors';
	static readonly HOUSEHOLDS		            = 'households';
	static readonly CRITERIAS		            = 'criterias';
	static readonly COMMODITY					= 'commodity';
	static readonly ADM1						= 'adm1';
	static readonly ADM2						= 'adm2';
	static readonly ADM3						= 'adm3';
	static readonly ADM4						= 'adm4';
    static readonly MAPSDATA					= 'mapsData';
    static readonly SPECIFICS                   = 'specifics';
    static readonly MODALITIES                  = 'modalities';
    static readonly VULNERABILITIES             = 'vulnerabilities';
    static readonly SUMMARY                     = 'summary';
    static readonly COUNTRY                     = 'country';
    static readonly PENDING_REQUESTS            = 'pending_requests';

    constructor(
        protected localStorage : LocalStorage,
        protected http: HttpClient,
    ) {
        this.storage = localStorage;
    }

    ngOnInit() {
        this.get(AsyncacheService.COUNTRY).subscribe(
            result => {
                AsyncacheService.actual_country = result;
            }
        )
    }

    formatKey(key : string) : string {
        if(key === AsyncacheService.COUNTRY || key === AsyncacheService.USER || key === AsyncacheService.USERS
            || key === AsyncacheService.PENDING_REQUESTS) {
            return this.PREFIX + '_' + key;
        } else {
            return this.PREFIX + '_' + AsyncacheService.actual_country + '_' + key;
        }
    }

    /**
     * Get an item from the cache asynchronously.
     * @param key 
     */
    get(key: string) {
        key = this.formatKey(key);

        if(key === this.formatKey(AsyncacheService.DISTRIBUTIONS)) {
            return this.getAllDistributions().pipe(
                map(
                    (result) => {
                        if(result) {
                            return result;
                        }
                    }
                )
            );
        } 
        else {
            return(
                this.storage.getItem(key).pipe(
                    map(
                        (result: CachedItemInterface) => {
                            if(result && result.storageTime + result.limit < (new Date).getTime()) {
                                if(result.canBeDeleted) {
                                    this.remove(key);
                                }
                                return null ;
                            } else if(result) {
                                //console.log('GET (', key, '): ', result.value);
                                return result.value;
                            } else {
                                return null;
                            }
                        }
                    )
                )
            );
        }
    }

    /**
     * Gets the list of distributions for each project in the cache and adds it in an observable array asynchronously.
     */
    getAllDistributions() {
        let allDistributions = new Array();

        return new Observable(
            (observer) => {
                this.get(AsyncacheService.PROJECTS).subscribe(
                    result => {
                        if(result) {
                            result.forEach(
                                (project, index) => {
                                    this.get(AsyncacheService.DISTRIBUTIONS + '_' + project.id).subscribe(
                                        distributions => {
                                            if(distributions && distributions.length>0) {
                                                distributions.forEach(
                                                    distrib => {
                                                        allDistributions.push(distrib);
                                                    }
                                                )
                                            }
                                            if(index === result.length-1) {
                                                observer.next(allDistributions);
                                                observer.complete();
                                            }
                                        }
                                    )
                                }
                            )
                        } else {
                            observer.next(null);
                            observer.complete();
                        }
                    },
                    error => {
                        observer.next(null);
                        observer.complete();
                    }
                )
            }
        );
    }

    /** 
     * Waits for asynchronous user value to return it synchronously.
    */
    getUser() : Observable<any>{
        return this.get(AsyncacheService.USER).pipe(
            map(
                result => {
                    let cachedUser = result;
                    if(!cachedUser) {
                        return new User();
                    } else {
                        return cachedUser;
                    }
                }
            )
        );
    }

    /**
     * Set an item in the cache semi-asynchronously.
     * @param key 
     * @param value 
     * @param options 
     */
    set(key: string, value: any, options: any = {}) {
        key = this.formatKey(key);
        
        this.localStorage.setItemSubscribe(key, value);
        if (options.canBeDeleted == null) {
			options.canBeDeleted = true;
        }
        
        options.timeout == options.timeout || this.MSTIMEOUT;

        let object: CachedItemInterface = {
			storageTime: (new Date()).getTime(), //in milliseconds
			value: value,
			limit: this.MSTIMEOUT, // in milliseconds
			canBeDeleted: options.canBeDeleted
        }
        this.localStorage.setItem(key, object).subscribe(
            result => {
                //console.log('SET (', key, '): ', object);
            }
        );

        if(key === this.formatKey(AsyncacheService.COUNTRY)) {
            AsyncacheService.actual_country = value;
        }
    }

    /**
     * Removes an item with its key.
     * @param key 
     */
    remove(key: string) {
        key = this.formatKey(key);
        this.storage.removeItemSubscribe(key);
    }

    /**
     * When requesting offline, this method will permit to store a special request object to save wanted PUTs/POSTs/DELETEs.
     * @param type 
     * @param request 
     */
    storeRequest(request: StoredRequestInterface) {
        let storedRequests : Array<StoredRequestInterface> = [];

        this.get(AsyncacheService.PENDING_REQUESTS).subscribe(
            result => {
                if(!result) {
                    storedRequests = [];
                } else {
                    storedRequests = result;
                }
                storedRequests.push(request);
                this.set(AsyncacheService.PENDING_REQUESTS, storedRequests);
            }
        );
    }

    /**
     * To send all the stored requests when online.
     */
    sendAllStoredRequests() {
        // TODO : update with new data structure
        this.get(AsyncacheService.PENDING_REQUESTS).subscribe(
            requests => {
                if(requests) {
                    let stillToBeSent = [];
                    
                    requests.forEach(
                        request => {
                            let method;

                            if(request.method === "PUT") {
                                method = this.http.put(request.url, request.body, request.options);
                            } else if(request.method === "POST") {
                                method = this.http.post(request.url, request.body, request.options);
                            } else if(request.method === "DELETE") {
                                method = this.http.delete(request.url, request.options);
                            } else {
                                method = null;
                            }

                            if(method) {
                                method.subscribe(
                                    sent => {
                                        console.log('Stored request (' + request.url + ') has been sent');
                                    },
                                    () => {
                                        console.log('Failed to send stored (' + request.url + ')');
                                        stillToBeSent.push(request);
                                    }
                                );
                            }
                        }
                    );
                    this.set(AsyncacheService.PENDING_REQUESTS, stillToBeSent);
                }
            }
        );
    }

    useMethod(request: StoredRequestInterface) {
        let httpMethod;

            if(request.method === "PUT") {
                httpMethod = this.http.put(request.url, request.body, request.options);
            } else if(request.method === "POST") {
                httpMethod = this.http.post(request.url, request.body, request.options);
            } else if(request.method === "DELETE") {
                httpMethod = this.http.delete(request.url, request.options);
            } else {
                httpMethod = null;
            }

        return httpMethod;
    }

    /**
     * Clear all the cache.
     * @param force 
     */
    clear(force : boolean = true) {
        if(force) {
            return this.storage.clear();
        } else {
            // TODO: find optimal code to adapt database clearing with deletable test.
        }
    }

    autoClear(force : boolean = true) {
        if(force) {
            this.storage.clearSubscribe();
        } else {
            // TODO: find optimal code to adapt database clearing with deletable test.
        }
    }

}
