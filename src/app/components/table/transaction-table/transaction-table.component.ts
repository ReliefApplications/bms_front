import { Component, OnInit, Input } from '@angular/core';
import { TableComponent } from '../table.component';

@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['../table.component.scss'],
})
export class TransactionTableComponent extends TableComponent {

    loading = true;

    public parentClassName: string;


    @Input() checkbox: boolean;

    @Input() set parent(value: any) {
        this.parentObject = value;
        this.parentClassName = this.parentObject.commodities[0].modality_type.name;
    }

    updateElement(updateElement) {
        this.distributionService.addNote(updateElement.generalReliefs[0].id, updateElement.notes).subscribe();
    }
}
