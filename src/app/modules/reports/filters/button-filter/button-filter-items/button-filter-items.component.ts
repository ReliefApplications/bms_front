import { Component, Input, OnInit } from '@angular/core';
import { ButtonFilterComponent } from '../button-filter.component';



@Component({
    selector: 'app-button-filter-items',
    templateUrl: './button-filter-items.component.html',
    styleUrls: ['./button-filter-items.component.scss']
})

export class ButtonFilterItemsComponent extends ButtonFilterComponent implements OnInit {

    public slides = [];


    ngOnInit() {
        this.generateSlides();
    }


    private generateSlides(): void {
        for (const item of this.data) {
            this.slides.push(
                {
                    slideInfo: {
                        icon: item.icon,
                        color: item.icon,
                        title: item.label,
                        ref: item.value,
                    },
                }
            );
        }
    }
}
