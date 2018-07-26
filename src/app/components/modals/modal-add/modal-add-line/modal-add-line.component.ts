import { Component, OnInit                                  } from '@angular/core';
import { ModalAddComponent                                  } from '../modal-add.component';
import { GlobalText                                         } from '../../../../../texts/global';
import { ConditionCriteriaMapper                            } from '../../../../model/condition-criteria-mapper';

@Component({
  selector: 'app-modal-add-line',
  templateUrl: './modal-add-line.component.html',
  styleUrls: ['./modal-add-line.component.scss']
})
export class ModalAddLineComponent extends ModalAddComponent{
  public checkCriteria = 0;

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.modal != GlobalText.TEXTS) {
      this.modal = GlobalText.TEXTS;
      this.entityDisplayedName = this.data.entity.getDisplayedName();
    } else if (this.oldEntity != this.data.entity) {
      this.checkData();
    }
    if(this.newObject.field_string && (this.checkCriteria != this.newObject.field_string)){
      this.fillCriteria(this.loadedData.field_string[this.newObject.field_string]);
      this.checkCriteria = this.newObject.field_string;
    }
  }
  
  fillCriteria(checkData){
    this.loadedData.condition_string = this.checkCondition(checkData);
  }

  checkCondition(checkData){
    let type = "";
    if(checkData.type)
      type = checkData.type.toLowerCase();
    return ConditionCriteriaMapper.mapConditionCriteria(type);
  }

  //emit the new object
  add():any {
    this.onCreate.emit(this.data.entity.formatFromModalAdd(this.newObject, this.loadedData));
    this.closeDialog();
  }
}
