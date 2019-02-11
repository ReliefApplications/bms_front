import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { SwiperConfigInterface, SwiperComponent } from 'ngx-swiper-wrapper';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  @Input() slides: any;

  @ViewChild(SwiperComponent) swiper: SwiperComponent;


  private indexOfSelectedSlide: number;

  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 20,
    navigation: true,
    mousewheel: true,
};

  @Output() slideSelected = new EventEmitter<String>();

  constructor() { }

  ngOnInit() {
    this.selectDefault();
  }

  private selectDefault(): void {
    if (this.slides) {
      this.selectOne(0);
    }
  }

  public selectOne(index: number): void {
    this.indexOfSelectedSlide = index;
    this.emitSelectedSlide();
  }


  // Used in HTML
  private checkIfSelected(index: number) {
    if (index === this.indexOfSelectedSlide) {
      return true;
    }
    return false;
  }

  private emitSelectedSlide(): void {
    const slide = this.getSlideFromIndex(this.indexOfSelectedSlide);
    this.slideSelected.emit(slide);
  }

  private getSlideFromIndex(index: number): any {
    return this.slides[index].slideInfo;
  }

  public update(): void {
    console.log("UPDATE");
    this.swiper.directiveRef.update();
  }
}
