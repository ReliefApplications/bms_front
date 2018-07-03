import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent                 } from '../modal.component';

@Component({
  selector   : 'reporting-modal-details',
  templateUrl: './modal-details.component.html',
  styleUrls  : ['./modal-details.component.scss']
})


export class ReportingModalDetailsComponent extends ModalComponent {

  @Input() modalComputedMethod: string;
  @Input() modalTitle: string;
  @Input() modalData: any; //optional data
  @Output() clearAction = new EventEmitter<boolean>();

  ngOnInit() {
  }

  fermer() {
    this.clearAction.emit(true);
  }

}
