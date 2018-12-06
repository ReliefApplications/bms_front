import { Injectable }                   from '@angular/core';
import { LocalStorage }                 from '@ngx-pwa/local-storage';
import { CachedItemInterface }          from './cached-item.interface';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from 'src/app/model/user';

@Injectable({
	providedIn: 'root'
})
export class AsyncacheService {

    private storage : any;
    readonly PREFIX                             = 'bms';
    readonly SECTIMEOUT 						= 2592000; // 30 day in seconds
    readonly MSTIMEOUT                          = this.SECTIMEOUT*1000;

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

    constructor(
        protected localStorage : LocalStorage,
    ) {
        this.storage = localStorage;
    }

    formatKey(key : string) : string {
        return this.PREFIX + '_' + key;
    }

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
                                console.log('GET (', key, '): ', result.value);
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
                console.log('SET (', key, '): ', object);
            }
        );
    }

    remove(key: string) {
        key = this.formatKey(key);
        this.storage.removeItemSubscribe(key);
    }

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
