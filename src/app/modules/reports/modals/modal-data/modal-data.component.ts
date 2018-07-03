import { Component, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ModalComponent } from '../modal.component';


@Component({
  selector: 'modal-data',
  templateUrl: './modal-data.component.html',
  styleUrls: ['./modal-data.component.scss']
})


export class ModalDataComponent extends ModalComponent {

  @Input() data: any;
  @Input() modalAxis: any;
  @Input() typeChartModal: string;
  @Input() filters: any ;
  @Input() indicatorConfig: any;
  @Output() closeMenu = new EventEmitter<boolean>();
  @Output() clearAction = new EventEmitter<boolean>();

  public bodyFilter: any;
  public dataModal: any;
  public exportMessage = false;
  public readyState = 0;

  ngOnInit(){
    if (this.data) {
      this.dataModal = this.data;
    }
  }

  ngOnChanges(){
    if (this.data) {
      this.dataModal = this.data;
    }
  }

  fermer() {
    this.exportMessage = false;
    this.closeMenu.emit(true);
    this.clearAction.emit(true);
  }
}
