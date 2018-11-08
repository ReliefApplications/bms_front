import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { ModalAddComponent } from '../modal-add.component';
import { GlobalText } from '../../../../../texts/global';
import { ConditionCriteriaMapper } from '../../../../model/condition-criteria-mapper';
import { CacheService } from '../../../../core/storage/cache.service';

@Component({
    selector: 'app-modal-add-line',
    templateUrl: './modal-add-line.component.html',
    styleUrls: ['../../modal.component.scss', './modal-add-line.component.scss']
})
export class ModalAddLineComponent extends ModalAddComponent {
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
        if (this.newObject.field_string && (this.checkCriteria != this.newObject.field_string)) {
            if (this.newObject.field_string == 8 || this.newObject.field_string == 9) {
                //Set kind beneficiary to 1 == Household
                this.newObject.kind_beneficiary = 2;
            }
            else {
                this.newObject.kind_beneficiary = 1;
            }

            this.checkType = this.newObject.kind_beneficiary;

            this.checkDataCriteria = this.loadedData.field_string[this.newObject.field_string - 1];
            this.loadedData.condition_string = this.checkCondition(this.checkDataCriteria);

            // Prefill for dateOfBirth
            if(this.newObject.field_string===2) {
                this.newObject.condition_string = 2;
            }

            this.checkCriteria = this.newObject.field_string;

        }
        else {
            this.loadedData.field_string = this.allCriteria;
        }
    }

    /**
     * Get the gender selected by the user
     * @param event
     */
    genderOnChange(event) {
        this.newObject.value_string = event.value;
    }

    /**
     * Get the date selected by the user
     * @param event
     */
    selectDate(event) {
        let day = event.value.getDate();
        let monthIndex = event.value.getMonth() + 1;
        let year = event.value.getFullYear();


        if (day < 10) {
            day = "0" + day;
        }
        if (monthIndex < 10) {
            monthIndex = "0" + monthIndex;
        }

        let finalDate = year + "-" + monthIndex + "-" + day;
        this.newObject.value_string = finalDate;
    }

    /**
     * for criteria's table
     * adapt condtion to the selected criteria
     * @param checkData
     */
    checkCondition(checkData) {
        let type = null;
        if (checkData.type)
            type = checkData.type.toLowerCase();

        return ConditionCriteriaMapper.mapConditionCriteria(type);
    }

    //emit the new object
    add(): any {
        if (this.newObject.weight > 0) {
            let newObject = this.data.entity.formatFromModalAdd( Object.assign({}, this.newObject), this.loadedData) ;
            if(newObject && (newObject.value_string && newObject.value_string === "null")) {
                this.snackBar.open(this.modal.modal_add_no_value, '', {duration: 3000, horizontalPosition: 'center'});
            } else if(!newObject) {
                this.snackBar.open(this.modal.modal_add_fail_criteria, '', {duration: 3000, horizontalPosition: 'center'});
                this.closeDialog();
            } else {
                this.onCreate.emit(newObject);
                this.closeDialog();
            }
        }
        else 
            this.snackBar.open(this.modal.modal_add_bad_weight, '', {duration: 3000, horizontalPosition: 'center'});   
    }
}
