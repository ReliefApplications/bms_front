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
    let entityInstance = this.mapperService.instantiate(this.entity);
    this.setMapperObject();
    this.properties = Object.getOwnPropertyNames(entityInstance.getMapperBox(entityInstance));
    this.elementObject = entityInstance.getMapperBox(this.componentDisplayed);
  }
  ngDoCheck() {
    if (this.box != GlobalText.TEXTS) {
      this.box = GlobalText.TEXTS;
      this.oldComponentDisplayed = null;
    }
    if(this.componentDisplayed != this.oldComponentDisplayed){
      let entityInstance = this.mapperService.instantiate(this.entity);
      this.elementObject = entityInstance.getMapperBox(this.componentDisplayed);
      this.oldComponentDisplayed = this.componentDisplayed;
    }

  }

  setMapperObject() {
    if (this.entity) {
      switch (this.entity.__classname__) {
        case 'DistributionData':
          this.mapperObject = this.mapper.getEntityTranslator("distribution_data"); break;
        case 'Donor':
          this.mapperObject = this.mapper.getEntityTranslator("donor"); break;
        case 'Project':
          this.mapperObject = this.mapper.getEntityTranslator("project"); break;
        case 'UserInterface':
          this.mapperObject = this.mapper.getEntityTranslator("user"); break;
        case 'CountrySpecific':
          this.mapperObject = this.mapper.getEntityTranslator("country_specific"); break;
        case 'Households':
          this.mapperObject = this.mapper.getEntityTranslator("households"); break;
        default: break;
      }
    }
  }

}
