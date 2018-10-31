import { Injectable }                   from '@angular/core';
import { LocalStorage }                 from '@ngx-pwa/local-storage';
import { CachedItemInterface }          from './cached-item.interface';
import { map } from 'rxjs/operators';

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
    static readonly TEST                        = 'test';

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

        return(
            this.storage.getItem(key).pipe(
                map(
                    (result: CachedItemInterface) => {
                        if(result.storageTime + result.limit > (new Date).getTime()) {

                        }
                        result.value
                )
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
			limit: this.MSTIMEOUT, // in seconds
			canBeDeleted: options.canBeDeleted
        }
        console.log(key);
        console.log(object);
        this.localStorage.setItem(key, object).subscribe(
            result => {
                console.log(result);
            }
        );
    }

    remove(key: string) {
        key = this.formatKey(key);
        this.storage.removeItemSubscribe(key);
    }

    deletable() {
        
    }
}
