import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { CustomDateAdapter } from '../../../core/utils/date.adapter';
import { CustomModelField } from '../../../model/CustomModel/custom-model-field';
import { ModalFieldsComponent } from '../modal-fields/modal-fields.component';
@Component({
    selector: 'app-modal-edit',
    templateUrl: '../modal-fields/modal-fields.component.html',
    styleUrls: ['../modal.component.scss', '../modal-fields/modal-fields.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalEditComponent extends ModalFieldsComponent implements OnInit {
    modalType = 'Edit';

    isDisabled(field: CustomModelField<any>) {
        return !field.isEditable;
    }
}
