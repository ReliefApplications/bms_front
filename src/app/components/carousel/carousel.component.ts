import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  @Input() slides: any;
  

  private indexOfSelectedSlide: number;

  public config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 7,
    spaceBetween: 20,
    navigation: true,
    mousewheel: true,

    breakpoints: {
      1000: {
        slidesPerView: 3,
      },
      750: {
        slidesPerView:2,
      }
    }
};

  @Output() slideSelected = new EventEmitter<String>();

  constructor() { }

  ngOnInit() {
    this.selectDefault();
  }

  private selectDefault(): void {
    if (this.slides) {
      this.deselectAll();
      this.selectOne(0);
    }
  }

  private deselectAll(): void {
    if (this.slides) {
      this.slides.forEach((_: any, index: number) => {
        this.deselectOne(index);
      });
    }

  }

  public selectOne(index: number): void {
    this.indexOfSelectedSlide = index;
    this.emitSelectedSlide();
    this.changeSelectedState(index, true);
  }

  private deselectOne(index: number) {
     this.changeSelectedState(index, false);
  }

  private changeSelectedState(index: number, state: boolean){
    this.slides[index].slideInfo.selected = state;
  }

  // Used in HTML
  private checkIfSelected(index: number) {
    if (index === this.indexOfSelectedSlide) {
      return true;
    }
    return false;
  }

  private emitSelectedSlide(): void {
    const name = this.getNameFromIndex(this.indexOfSelectedSlide);
    this.slideSelected.emit(name);
  }

  private getNameFromIndex(index: number): string {
    return this.slides[index].slideInfo.ref;
  }
}
