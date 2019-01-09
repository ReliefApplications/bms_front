import { Component, OnInit, Output, Input, Inject } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { EventEmitter } from 'protractor';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-modal-leave',
  templateUrl: './modal-leave.component.html',
  styleUrls: ['../modal.component.scss', './modal-leave.component.scss']
})
export class ModalLeaveComponent implements OnInit {

    // @Output() choice = new EventEmitter();

    public TEXT = GlobalText.TEXTS;

    constructor(
        private dialogs: MatDialogRef<ModalLeaveComponent>,
        @Inject(MAT_DIALOG_DATA) public data
    ) { }

    ngOnInit() {
    }

    leave() {
        // this.choice.emit('true');
        if (this.data.data === 'validation') {
            this.data.service.sendData(this.data.email, this.data.correctedData, this.data.project, this.data.step, this.data.token).then(() => {
                this.dialogs.close(true);
            }, (err) => {
                this.data.snackBar.open(this.TEXT.import_failed, '', { duration: 5000, horizontalPosition: 'center' })
            });
        }
        else {
            this.dialogs.close(true);
        }
    }

    cancel() {
        // this.choice.emit('false');
        this.dialogs.close(false);
    }

}
