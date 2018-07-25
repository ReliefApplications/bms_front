import { Component, OnInit, Input, EventEmitter, Output                           } from '@angular/core';
import { ModalComponent                                                           } from '../modal.component';
import { GlobalText                                                               } from '../../../../texts/global';

@Component({
  selector: 'app-modal-add',
  templateUrl: './modal-add.component.html',
  styleUrls: ['./modal-add.component.scss']
})
export class ModalAddComponent extends ModalComponent {
  public entityDisplayedName = "";
  
  @Input() data:    any;
  @Output() onCreate = new EventEmitter();

  ngOnInit() {
    this.data.mapper.setMapperObject(this.data.entity);
    
    this.newObject = this.data.mapper.instantiate(this.data.entity);
    this.entityDisplayedName = this.data.entity.getDisplayedName();
    this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
    this.propertiesTypes = this.newObject.getModalTypeProperties(this.newObject);
    this.loadData();
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.modal != GlobalText.TEXTS) {
      this.modal = GlobalText.TEXTS;
      this.entityDisplayedName = this.data.entity.getDisplayedName();
    }
  }

  //emit the new object
  add():any {
    this.onCreate.emit(this.newObject);
    this.closeDialog();
  }
}
