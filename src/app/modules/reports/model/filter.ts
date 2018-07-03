import { EventEmitter, Output, Input } from "@angular/core";


export interface FilterInterface {
    /**
     * This key should be used to tell to the chart component how to format the currentvalue before sending it
     */
    referenceKey: string;
    
    filter(newFilter);
    getFullname(): string;
}

export class FilterEvent {
    /**
     * filters block id
     */
    id: string
    /**
     * page id
     */
    page: string
    /**
     * data for the button
     */
    data: any

    constructor(id: string, page: string, data: any) {
        this.id = id;
        this.page = page;
        this.data = data;
    }
}


export abstract class AbstractFilter implements FilterInterface {

    /**
     * if  one filter in the block is active
     */
    active: boolean = false;

    @Input() id: string;
    @Input() page: string;
    @Input() referenceKey: string;

    @Output() emitFilter: EventEmitter<FilterEvent> = new EventEmitter();

    constructor(
    ) { }

    /**
     * Emit the event whith the new filter 
     * @param newFilter 
     */
    filter (newFilter: any) {
        this.emitFilter.emit(new FilterEvent( this.id, this.page, newFilter ));
    }

    /**
     * Create an unique name for filter with its id and its page
     */
    getFullname(): string {
        return AbstractFilter.formatFullname(this.page, this.id) ;
    }


    /**
     * Format filter's name 
     * @param page 
     * @param id 
     */
    static formatFullname(page: string, id:string): string {
        return page + '_' + id;
    }
}
