import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { TableComponent } from '../../table.component';
import { Beneficiaries } from '../../../../model/beneficiary';
import { tap, finalize } from 'rxjs/operators';
import { DistributionData } from '../../../../model/distribution-data';


@Component({
  selector: 'app-table-beneficiaries-offline',
  templateUrl: './table-beneficiaries-offline.component.html',
  styleUrls: ['../../table.component.scss'],
})
export class TableBeneficiariesOfflineComponent extends TableComponent {

  @Output() updating = new EventEmitter<number>();
  
  update(selectedBeneficiary: Beneficiaries) {
    this.updating.emit(selectedBeneficiary.id);
}

  getImageName(t2: String) {
    if (t2)
      return (t2.substring(25).split('.')[0]);
  }
}