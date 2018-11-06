import { Injectable }                   from '@angular/core';
import { LocalStorage }                 from '@ngx-pwa/local-storage';
import { CachedItemInterface }          from './cached-item.interface';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

        // if(key === this.formatKey(AsyncacheService.DISTRIBUTIONS)) {
        //     return this.getAllDistributions();
        // } 
        // else {
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
                                // console.log('GET (', key, '): ', result.value);
                                return result.value;
                            } else {
                                return null;
                            }
                        }
                    )
                )
            );
        // }
    }

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
                                            allDistributions.push(distributions);

                                            observer.next(allDistributions);
                                            if(index === result.length-1) {
                                                observer.complete();
                                            }
                                        }
                                    )
                                }
                            )
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
                // console.log('SET (', key, '): ', object);
            }
        );
    }

    remove(key: string) {
        key = this.formatKey(key);
        this.storage.removeItemSubscribe(key);
    }

    clear(force : boolean = false) {
        if(force) {
            this.storage.clearSubscribe();
        } else {
            // TODO: find optimal code to adapt database clearing with deletable test.
        }
    }

}
