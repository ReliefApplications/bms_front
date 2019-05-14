import { Injectable } from '@angular/core';
import { FilterInterface } from '../../../models/filter';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    /**
     * List of filters registered
     */
    static registeredFilters: any = {};

    constructor(
    ) { }

    /**
     * Register filters block to avoid duplicate
     * @param filters
     */
    subscribe(filter: Array<FilterInterface> | FilterInterface);
    subscribe(filterObject: any) {
        if (Array.isArray(filterObject)) {
            filterObject.forEach((object: FilterInterface) => {
                this.addSingleFilter(object);
            });
        } else {
            this.addSingleFilter(filterObject);
        }
    }

    /**
     * Get unique name of filter for registration and verify if filter already exist in list registeredFilters
     * @param filter
     */
    private addSingleFilter(filterObject: FilterInterface) {
        if (!FilterService.registeredFilters[filterObject.getFullname()]) {
            FilterService.registeredFilters[filterObject.getFullname()] = filterObject;
        }
    }

    /**
     * Delete filter in the list registeredFilters
     * @param filter
     */
    unsubscribe(filterObject: FilterInterface) {
        delete FilterService.registeredFilters[filterObject.getFullname()];
    }
}
