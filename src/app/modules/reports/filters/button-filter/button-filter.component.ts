import { Component, Input } from '@angular/core';
import { AbstractFilter, FilterInterface } from '../../../../model/filter';
import { FilterService } from '../../services/filter.service';
import { SelectionModel } from '@angular/cdk/collections';

import { SlideSelectorService } from 'src/app/core/utils/slide-selector.service';

export interface ButtonFilterData {
    label: string
    value: string
    active: boolean
    color?: string
    icon?: string
    level: string
}

@Component({
    selector: 'button-filter',
    templateUrl: './button-filter.component.html',
    styleUrls: ['./button-filter.component.scss']
})


export class ButtonFilterComponent extends AbstractFilter {

    @Input() data: Array<ButtonFilterData>;
    @Input() selectedItem;

    constructor(
        private filterService: FilterService,
        protected slideSelectorService: SlideSelectorService,

    ) {
        super();
    }

    ngOnInit() {
        this.filterService.subscribe(this);
        if (this.data && this.data[0]) {
            this.selectedItem = this.data[0].value;
        }
    }


    /**
     * Allow to know which block and which button in block is active
     * @param newFilter
     */
    filter(newFilter: any) {
        this.active = !this.active;
        this.data.forEach((item: ButtonFilterData) => {
            if (item.value === newFilter || item.value !== newFilter && item.active) {
                item.active = !item.active;
            }
        })
        super.filter(newFilter);
        this.selectedItem = newFilter;
    }

}