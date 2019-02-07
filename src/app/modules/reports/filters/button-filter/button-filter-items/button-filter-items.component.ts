import { Component, Input, OnInit        } from '@angular/core';
import { ButtonFilterComponent } from '../button-filter.component';


@Component({
  selector   : 'button-filter-items',
  templateUrl: './button-filter-items.component.html',
  styleUrls  : ['./button-filter-items.component.scss']
})


export class ButtonFilterItemsComponent extends ButtonFilterComponent {

  public carouselReady = false;
  public slides = [];

  ngOnInit(){
    this.generateSlides();
    this.carouselReady = true;

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
              selected: false,
          },
        }
      );
    }
    console.log(this.carouselReady);
    console.log(this.slides);
  }
}