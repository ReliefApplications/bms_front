import { Component, OnInit, Input                                                           } from '@angular/core';
import { BoxComponent                                                                       } from '../box.component';

@Component({
  selector: 'app-box-properties',
  templateUrl: './box-properties.component.html',
  styleUrls: ['./box-properties.component.scss']
})
export class BoxPropertiesComponent extends BoxComponent {
  @Input() componentDisplayed;
  @Input() mapperService;
  @Input() entity;
  private oldComponentDisplayed = null;
  public properties: any;

  ngDoCheck() {
    if(this.componentDisplayed != this.oldComponentDisplayed){
      let entityInstance = this.mapperService.instantiate(this.entity);
      this.mapperService.setMapperObject(this.entity);
      this.properties = Object.getOwnPropertyNames(entityInstance.getMapperBox(entityInstance));
      this.oldComponentDisplayed = this.componentDisplayed;
    }
   
  }

}
