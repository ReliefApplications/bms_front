import { Component, OnInit, OnDestroy, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { SwiperConfigInterface, SwiperComponent } from 'ngx-swiper-wrapper';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  @Input() slides: any;

  @Input() set externalSelectedSlide(slide: any) {
    if (slide !== this.selectedSlide) {
      this.selectOne(slide);
    }
  }

  @Output() slideSelected: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(SwiperComponent) swiper: SwiperComponent;

  private selectedSlide: any;

  private config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 20,
    navigation: true,
    mousewheel: true,
};

  constructor() { }

  ngOnInit() {
  }


  private selectOne(slide: any): void {
    const index = this.getSlideIndex(slide);
    if (index !== -1) {
      this.setSwiperIndex(index);
    }
    this.selectedSlide = slide;
  }

  private getSlideIndex(slide: any): any {
    return this.slides.indexOf(slide);
  }

  private setSwiperIndex(index: number) {
    this.swiper.directiveRef.setIndex(index);
  }

  private onSlideClicked(slide: any) {
    this.slideSelected.emit(slide);
    this.selectOne(slide);
  }

  // Used in HTML
  private checkIfSelected(slide: any) {
    if (slide === this.selectedSlide) {
      return true;
    }
    return false;
  }

  public update(): void {
    this.swiper.directiveRef.update();
    this.setSwiperIndex(0);
  }

}
