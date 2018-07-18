import { Component, OnInit, Input, EventEmitter, Output                          } from '@angular/core';
import { ModalComponent                                    } from '../modal.component';

@Component({
  selector: 'modal-delete',
  templateUrl: './modal-delete.component.html',
  styleUrls: ['./modal-delete.component.scss']
})
export class ModalDeleteComponent extends ModalComponent {
  
  @Input() data:    any;
  @Output() onDelete = new EventEmitter();

  ngOnInit() {
  }

  //emit the object to delete
  delete():any {
    this.onDelete.emit(this.data.data);
    this.closeDialog();
  }
}
