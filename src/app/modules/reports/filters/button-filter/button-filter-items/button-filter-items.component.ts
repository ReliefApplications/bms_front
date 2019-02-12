import { Component, Input, OnInit        } from '@angular/core';
import { ButtonFilterComponent } from '../button-filter.component';

import { Subscription } from 'rxjs';


@Component({
  selector   : 'button-filter-items',
  templateUrl: './button-filter-items.component.html',
  styleUrls  : ['./button-filter-items.component.scss']
})


export class ButtonFilterItemsComponent extends ButtonFilterComponent {

  public carouselReady = false;
  public slides = [];

  private slideSubscriber: Subscription;

  ngOnInit() {
    this.generateSlides();
    this.slideSelectorService.setSlides(this.slides);
    this.slideSubscriber = this.slideSelectorService.selectedSlide.subscribe((slide: any) => {
      if (slide) {
          this.filterSlide(slide);
      }
    });
  }

  ngOnDestroy(): void {
    this.slideSubscriber.unsubscribe();
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
