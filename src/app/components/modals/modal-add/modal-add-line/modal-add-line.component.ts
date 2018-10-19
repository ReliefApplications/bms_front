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
            console.log('1');
            this.checkData();
        }
        if (this.newObject.field_string && (this.checkCriteria != this.newObject.field_string)) {
            console.log('2');
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
            this.checkCriteria = this.newObject.field_string;
            console.log(this.checkCriteria, this.checkDataCriteria);
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
        console.log("cc");
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
        let newObject = Object.assign({}, this.newObject);
        if(newObject)
        this.onCreate.emit(this.data.entity.formatFromModalAdd(newObject, this.loadedData));
        console.log(newObject);
        this.closeDialog();
    }
}
