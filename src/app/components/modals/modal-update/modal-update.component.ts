import { Component, OnInit, Input                          } from '@angular/core';
import { ModalComponent                                    } from '../modal.component';

@Component({
  selector: 'modal-update',
  templateUrl: './modal-update.component.html',
  styleUrls: ['./modal-update.component.scss']
})
export class ModalUpdateComponent extends ModalComponent {

  @Input() data:    any;

  ngOnInit() {
    this.entityInstance = this.data.mapper.instantiate(this.data.entity);
    this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapperDetails(this.entityInstance));
  }
}
