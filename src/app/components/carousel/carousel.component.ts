import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { SwiperConfigInterface, SwiperComponent } from 'ngx-swiper-wrapper';
import { SlideSelectorService } from 'src/app/core/utils/slide-selector.service';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  @Input() slides: any;

  @ViewChild(SwiperComponent) swiper: SwiperComponent;


  private selectedSlide: any;

  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 20,
    navigation: true,
    mousewheel: true,
};

  @Output() slideSelected = new EventEmitter<String>();

  constructor(
    private slideSelectorService: SlideSelectorService,
  ) { }

  ngOnInit() {
    this.slideSelectorService.selectedSlide.subscribe((slide: any) => {
      this.selectOne(slide);
    });
  }

  private onSlideClicked(slide: any): void {
    this.slideSelectorService.selectSlide(slide);
  }

  public selectOne(slide: any): void {
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


  // Used in HTML
  private checkIfSelected(slide: any) {
    if (slide === this.selectedSlide) {
      return true;
    }
    return false;
  }

  private emitSelectedSlide(): void {
    if (this.slides.length) {
      const slide = this.getSlideFromIndex(this.indexOfSelectedSlide);
      this.slideSelected.emit(slide);
    }
  }

  private getSlideFromIndex(index: number): any {
    return this.slides[index].slideInfo;
  }

  public update(): void {
    this.swiper.directiveRef.update();
  }

}
