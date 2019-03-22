import { Component, OnInit, Input, Inject } from '@angular/core';
import { ModalFieldsComponent } from '../modal-fields/modal-fields.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { GlobalText } from '../../../../texts/global';
import { CustomModelField } from '../../../model/CustomModel/custom-model-field';

@Component({
    selector: 'app-modal-details',
    templateUrl: '../modal-fields/modal-fields.component.html',
    styleUrls: ['../modal-fields/modal-fields.component.scss']
})
export class ModalDetailsComponent extends ModalFieldsComponent implements OnInit {

    modalTitle = GlobalText.TEXTS.modal_details_title;

    modalType = 'Details';

    constructor(
        public modalReference: MatDialogRef<ModalDetailsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(modalReference, data);
    }

    isDisabled(field: CustomModelField<any>) {
        return true;
    }
}
