import { Component, OnInit, Input } from '@angular/core';
import { ModalComponent } from '../modal.component';

@Component({
    selector: 'app-modal-details',
    templateUrl: './modal-details.component.html',
    styleUrls: ['../modal.component.scss', './modal-details.component.scss']
})
export class ModalDetailsComponent extends ModalComponent implements OnInit {

    @Input() data: any;

    ngOnInit() {
        this.entityInstance = this.data.mapper.instantiate(this.data.entity);
        this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapperDetails(this.entityInstance));
    }
}
