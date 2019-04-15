import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableComponent } from '../table.component';
import { GeneralRelief } from 'src/app/model/general-relief';
import { DistributionData } from 'src/app/model/distribution-data';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['../table.component.scss'],
})
export class TransactionTableComponent extends TableComponent {

    loading = true;

    @Input() checkbox: boolean;

    @Input() parentObject: DistributionData;
    @Output() reloadTable = new EventEmitter<string>();

    // THE NEXT FUNCTION NEEDS TO BE PUT IN THE GENERAL RELIEF COMPONENT


    // updateElement(updateElement) {
    //     // Only keeps general reliefs where a note has been set
    //     const notes = updateElement.generalReliefs
    //         .filter((generalRelief: GeneralRelief) => {
    //             return {
    //                 id: generalRelief.id,
    //                 notes: generalRelief.notes
    //             };
    //         });

    //     // Send a request to the server to add a note
    //     this.distributionService.addNotes(notes).subscribe(() => {
    //         const beneficiaries = this.parentObject.distribution_beneficiaries;
    //         // Update the beneficiary locally
    //         for (let i = 0; i < beneficiaries.length; i++) {
    //             if (beneficiaries[i].beneficiary.id === updateElement.id) {
    //                 beneficiaries[i].general_reliefs = updateElement.generalReliefs;
    //                 // Save the modification to the cache
    //                 this._cacheService.set(`${AsyncacheService.DISTRIBUTIONS}_${this.parentObject.id}_beneficiaries`, this.parentObject);
    //                 return;
    //             }
    //         }
    //     });
    // }

    // THE NEXT TWO FUNCTIONS NEED TO BE PUT IN THE QR VOUCHER COMPONENT

    // print(element: any) {
    //     return this._exportService.printVoucher(element.booklet.id);
    // }

    // assign(element: any) {
    //     const dialogRef = this.dialog.open(ModalAssignComponent, {
    //         data: {
    //             beneficiary: element,
    //             project: this.parentObject.project,
    //             distribution: this.parentObject,
    //         }
    //     });
    //     dialogRef.afterClosed().subscribe((test) => {
    //         this.reloadTable.emit();
    //     });
    // }

    // THE NEXT TWO FUNCTIONS NEED TO BE PUT IN THE TRANSACTIONVOUCHER MODEL

    // isPrintable(element: any): boolean {
    //     return element.booklet;
    // }

    // isAssignable(element: any): boolean {
    //     if (element.booklet && element.booklet.status !== 3) {
    //       return false;
    //     }
    //     return true;
    // }
}
