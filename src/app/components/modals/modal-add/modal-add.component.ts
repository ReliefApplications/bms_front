import { Component, OnInit, Input, EventEmitter, Output                          } from '@angular/core';
import { ModalComponent                                    } from '../modal.component';

@Component({
  selector: 'app-modal-add',
  templateUrl: './modal-add.component.html',
  styleUrls: ['./modal-add.component.scss']
})
export class ModalAddComponent extends ModalComponent {
  
  @Input() data:    any;
  @Output() onCreate = new EventEmitter();

  ngOnInit() {
    this.newObject = this.data.mapper.instantiate(this.data.entity);
    this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    console.log(this.properties);
    this.propertiesTypes = this.newObject.getModalTypeProperties(this.newObject);
    this.loadData();
  }

  //emit the new object
  add():any {
    this.onCreate.emit(this.newObject);
    this.closeDialog();
  }
}
