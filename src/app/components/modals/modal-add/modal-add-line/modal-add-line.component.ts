import { Component, OnInit, ViewChildren, QueryList, Input                                  } from '@angular/core';
import { ModalAddComponent                                  } from '../modal-add.component';
import { GlobalText                                         } from '../../../../../texts/global';
import { ConditionCriteriaMapper                            } from '../../../../model/condition-criteria-mapper';
import { CacheService } from '../../../../core/storage/cache.service';

@Component({
  selector: 'app-modal-add-line',
  templateUrl: './modal-add-line.component.html',
  styleUrls: ['./modal-add-line.component.scss']
})
export class ModalAddLineComponent extends ModalAddComponent{
  public checkCriteria = -1;
  public checkDataCriteria = [];

  public checkType = "";
  public myForm;

  /**
   * check if the langage has changed
   * or if a select field has changed
   */
  ngDoCheck() {
    if (this.modal != GlobalText.TEXTS) {
      this.modal = GlobalText.TEXTS;
      this.entityDisplayedName = this.data.entity.getDisplayedName();
    } else if (this.oldEntity != this.data.entity) {
      this.checkData();
    }
    if(this.newObject.field_string && (this.checkCriteria != this.newObject.field_string)){

      this.checkDataCriteria = this.loadedData.field_string[this.newObject.field_string-1];
      this.loadedData.condition_string = this.checkCondition(this.checkDataCriteria);
      this.checkCriteria = this.newObject.field_string;
    }
    if(this.checkType != this.newObject.kind_beneficiary) {
      this.loadedData.condition_string = [];
      this.checkDataCriteria = [];
      
      if(this.newObject.kind_beneficiary === 1) {
        this.loadedData.field_string =  this.allCriteria.filter(item => item.distribution_type === 'Beneficiary');

      } else {
        this.loadedData.field_string = this.allCriteria.filter(item => item.distribution_type === 'Household');
      }
      this.checkType = this.newObject.kind_beneficiary;
    }
  }


  /**
   * for criteria's table
   * adapt condtion to the selected criteria
   * @param checkData 
   */
  checkCondition(checkData){
    let type = null;
    if(checkData.type)
      type = checkData.type.toLowerCase();

    return ConditionCriteriaMapper.mapConditionCriteria(type);
  }

  //emit the new object
  add():any {
    let newObject = Object.assign({}, this.newObject);
    this.onCreate.emit(this.data.entity.formatFromModalAdd(newObject, this.loadedData));
    this.closeDialog();
  }
}
