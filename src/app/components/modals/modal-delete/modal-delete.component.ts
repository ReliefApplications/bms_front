import { Component, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { GlobalText } from 'src/texts/global';

@Component({
    selector: 'app-modal-delete',
    templateUrl: './modal-delete.component.html',
    styleUrls: ['../modal.component.scss', './modal-delete.component.scss']
})
export class ModalDeleteComponent {

    texts = GlobalText.TEXTS;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public modalReference: MatDialogRef<any>) {
    }

    onDelete(): any {
        this.modalReference.close('Delete');
    }

    onCancel() {
        this.modalReference.close('Cancel');
    }
}
