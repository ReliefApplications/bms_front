import { Injectable } from '@angular/core';
import { FilterInterface } from '../../../model/filter';
import { filter } from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class FilterService {

    /**
     * List of filters registered
     */
    static registeredFilters: any = {} ;

    constructor(
    ) {

    }

    /**
     * Register filters block to avoid duplicate
     * @param filters 
     */
    subscribe(filters: Array<FilterInterface>)
    subscribe(filter: FilterInterface)
    subscribe(filterObject: any) {
        if(Array.isArray(filterObject)){
            filterObject.forEach((filter: FilterInterface) => {
                this.addSingleFilter(filter);
            })
        } else {
            this.addSingleFilter(filterObject);
        }
    }

    /**
     * Get unique name of filter for registration and verify if filter already exist in list registeredFilters
     * @param filter 
     */
    private addSingleFilter(filter: FilterInterface) {
        if (!FilterService.registeredFilters[filter.getFullname()]) 
        {
            FilterService.registeredFilters[filter.getFullname()] = filter;
        }
        
    }

    /**
     * Delete filter in the list registeredFilters
     * @param filter 
     */
    unsubscribe(filter: FilterInterface) {
        delete FilterService.registeredFilters[filter.getFullname()];
    }

    
}
