import { Component, OnInit, Output } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { EventEmitter } from 'protractor';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-modal-leave',
  templateUrl: './modal-leave.component.html',
  styleUrls: ['../modal.component.scss', './modal-leave.component.scss']
})
export class ModalLeaveComponent implements OnInit {

    // @Output() choice = new EventEmitter();

    public TEXT = GlobalText.TEXTS;

    constructor(
        private dialogs: MatDialogRef<ModalLeaveComponent>
    ) { }

    ngOnInit() {
    }

    leave() {
        // this.choice.emit('true');
        this.dialogs.close(true);
    }

    cancel() {
        // this.choice.emit('false');
        this.dialogs.close(false);
    }

}
