import { Component, HostListener, OnInit, Input } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FieldMapper } from '../../../model/field-mapper';

@Component({
  selector: 'app-box-properties',
  templateUrl: './box-properties.component.html',
  styleUrls: ['./box-properties.component.scss']
})
export class BoxPropertiesComponent {
  public box = GlobalText.TEXTS;
  mapper: FieldMapper = new FieldMapper();
  mapperObject = null;
  elementObject = null;

  @Input() componentDisplayed;
  @Input() mapperService;
  @Input() entity;
  private oldComponentDisplayed = null;
  public properties: any;
  public numColumns = 0;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.numberOfColumns();
  }

  ngOnInit() {
    let entityInstance = Object.create(this.entity.prototype);
    entityInstance.constructor.apply(entityInstance);
    this.mapperObject = this.mapperService.findMapperObject(this.entity);
    this.properties = Object.getOwnPropertyNames(entityInstance.getMapperBox(entityInstance));
    this.numberOfColumns();
    this.elementObject = entityInstance.getMapperBox(this.componentDisplayed);
  }

  ngDoCheck() {
    if (this.box != GlobalText.TEXTS) {
      this.box = GlobalText.TEXTS;
      this.oldComponentDisplayed = null;
    }
    if(this.componentDisplayed != this.oldComponentDisplayed){
      let entityInstance = Object.create(this.entity.prototype);
      entityInstance.constructor.apply(entityInstance);
      this.elementObject = entityInstance.getMapperBox(this.componentDisplayed);
      this.oldComponentDisplayed = this.componentDisplayed;
    }
  }

  isArray(obj : any) {
    return Array.isArray(obj)
  }

  numberOfColumns(): void {
    let length = Object.keys(this.properties).length;
    if (window.innerWidth > 700) {
      this.numColumns = length;
    }
    else if (window.innerWidth > 400 && window.innerWidth < 700) {
      this.numColumns = length/2;
    }
    else {
      this.numColumns = length/3;
    }
  }
}
