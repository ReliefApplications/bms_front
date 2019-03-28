import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DIALOG_DATA } from '@angular/material';
import { APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { GlobalText } from '../../../../texts/global';
import { CustomDateAdapter } from '../../../core/utils/date.adapter';
import { CustomModelField } from '../../../model/CustomModel/custom-model-field';
import { ModalFieldsComponent } from '../modal-fields/modal-fields.component';
@Component({
    selector: 'app-modal-add',
    templateUrl: '../modal-fields/modal-fields.component.html',
    styleUrls: ['../modal.component.scss', '../modal-fields/modal-fields.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalAddComponent extends ModalFieldsComponent implements OnInit {
    modalTitle = GlobalText.TEXTS.modal_add_title;
    modalType = 'Add';

    isDisabled(field: CustomModelField<any>) {
        return !field.isSettable;
    }
}
