import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DateAdapter, MatDialogRef, MAT_DATE_FORMATS, MAT_DIALOG_DATA } from '@angular/material';
import { APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { CustomDateAdapter } from '../../../core/utils/date.adapter';
import { ModalWriteComponent } from '../modal-write/modal-write.component';
import { CustomModelField } from '../../../model/CustomModel/custom-model-field';
import { GlobalText } from 'src/texts/global';
@Component({
    selector: 'app-modal-edit',
    templateUrl: '../modal-write/modal-write.component.html',
    styleUrls: ['../modal.component.scss', '../modal-write/modal-write.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalEditComponent extends ModalWriteComponent implements OnInit {
    modalTitle = GlobalText.TEXTS.modal_edit_title;

    constructor(
        public modalReference: MatDialogRef<ModalEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        super(modalReference, data);
    }

    isDisabled(field: CustomModelField<any>) {
        return !field.isEditable;
    }
}
