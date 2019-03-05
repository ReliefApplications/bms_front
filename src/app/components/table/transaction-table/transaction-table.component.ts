import { Component, Input } from '@angular/core';
import { TableComponent } from '../table.component';
import { GeneralRelief } from 'src/app/model/general-relief';
import { DistributionData } from 'src/app/model/distribution-data';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['../table.component.scss'],
})
export class TransactionTableComponent extends TableComponent {

    loading = true;

    @Input() checkbox: boolean;

    @Input() parentObject: DistributionData;

    updateElement(updateElement) {
        const notes = updateElement.generalReliefs
            .filter((generalRelief: GeneralRelief) => {
                if (generalRelief.notes) {
                    return true;
                }
            });

        console.log(updateElement);

        this.distributionService.addNotes(notes).subscribe(() => {
            console.log(this.parentId, this.parentObject, this.allData);
        });
    }
}
