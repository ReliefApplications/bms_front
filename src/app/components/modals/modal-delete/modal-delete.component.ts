import { Component, OnInit, Input                          } from '@angular/core';
import { ModalComponent                                    } from '../modal.component';

@Component({
  selector: 'modal-delete',
  templateUrl: './modal-delete.component.html',
  styleUrls: ['./modal-delete.component.scss']
})
export class ModalDeleteComponent extends ModalComponent {
  
  @Input() data:    any;

  ngOnInit() {
  }
}
