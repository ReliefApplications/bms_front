import { Component, OnInit, Input } from '@angular/core';
import { BoxComponent } from '../box.component';
import { GlobalText } from '../../../../texts/global';
import { FieldMapper } from '../../../model/field-mapper';

@Component({
  selector: 'app-box-properties',
  templateUrl: './box-properties.component.html',
  styleUrls: ['./box-properties.component.scss']
})
export class BoxPropertiesComponent extends BoxComponent {
  public box = GlobalText.TEXTS;
  mapper: FieldMapper = new FieldMapper();
  mapperObject = null;
  elementObject = null;

  @Input() componentDisplayed;
  @Input() mapperService;
  @Input() entity;
  private oldComponentDisplayed = null;
  public properties: any;

  ngOnInit() {
    let entityInstance = Object.create(this.entity.prototype);
    entityInstance.constructor.apply(entityInstance);
    this.mapperObject = this.mapperService.findMapperObject(this.entity);
    this.properties = Object.getOwnPropertyNames(entityInstance.getMapperBox(entityInstance));
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
}
