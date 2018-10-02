import { Component, Output, EventEmitter } from '@angular/core';
import { TableComponent } from '../table.component';
import { Beneficiaries } from '../../../model/beneficiary';
import { emit } from 'cluster';

@Component({
  selector: 'app-table-beneficiaries',
  templateUrl: './table-beneficiaries.component.html',
  styleUrls: ['./table-beneficiaries.component.scss']
})
export class TableBeneficiariesComponent extends TableComponent {

    @Output() updating = new EventEmitter<number>();

    getImageName(t2: String) {

        return( t2.substring(25).split('.')[0] );
    }

    update(selectedBeneficiary: Beneficiaries) {

        this.updating.emit(selectedBeneficiary.id);
    }

}
