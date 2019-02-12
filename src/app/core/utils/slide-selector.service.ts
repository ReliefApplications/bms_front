import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SlideSelectorService {

  private slides: any[];

  private slideSource: BehaviorSubject<any> = new BehaviorSubject(null);
  public selectedSlide: any = this.slideSource.asObservable();

  constructor() { }

  public setSlides(slides: any[]) {
    this.slides = slides;
    this.slideSource.next(this.slides[0]);
  }

  public selectSlide(slide: any) {
    this.slideSource.next(slide);
  }
}
