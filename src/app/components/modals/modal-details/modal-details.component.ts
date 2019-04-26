import { Component } from '@angular/core';
import { CustomModelField } from '../../../model/CustomModel/custom-model-field';
import { ModalFieldsComponent } from '../modal-fields/modal-fields.component';

@Component({
    selector: 'app-modal-details',
    templateUrl: '../modal-fields/modal-fields.component.html',
    styleUrls: ['../modal-fields/modal-fields.component.scss']
})
export class ModalDetailsComponent extends ModalFieldsComponent {

    modalType = 'Details';

    isDisabled(field: CustomModelField<any>) {
        return true;
    }
}
