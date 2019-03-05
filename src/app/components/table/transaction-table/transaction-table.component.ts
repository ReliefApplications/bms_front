import { Component, Input } from '@angular/core';
import { TableComponent } from '../table.component';
import { GeneralRelief } from 'src/app/model/general-relief';
import { DistributionData } from 'src/app/model/distribution-data';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

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
        // Only keeps general reliefs where a note has been set
        const notes = updateElement.generalReliefs
            .filter((generalRelief: GeneralRelief) => generalRelief.notes);

        // Send a request to the server to add a note
        this.distributionService.addNotes(notes).subscribe(() => {
            const beneficiaries = this.parentObject.distribution_beneficiaries;
            // Update the beneficiary locally
            for (let i = 0; i < beneficiaries.length; i++) {
                if (beneficiaries[i].beneficiary.id === updateElement.id) {
                    beneficiaries[i].general_reliefs = updateElement.generalReliefs;
                    // Save the modification to the cache
                    this._cacheService.set(`${AsyncacheService.DISTRIBUTIONS}_${this.parentObject.id}_beneficiaries`, this.parentObject);
                    return;
                }
            }
        });
    }
}
