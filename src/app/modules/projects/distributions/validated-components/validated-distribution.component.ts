import { Component, ViewChild, OnInit, Input, Output, EventEmitter, HostListener, DoCheck } from '@angular/core';
import { DistributionData } from 'src/app/model/distribution-data';
import { GlobalText } from 'src/texts/global';
import { MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { BeneficiariesService } from 'src/app/core/api/beneficiaries.service';
import { DistributionService } from 'src/app/core/api/distribution.service';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    template: '',
    styleUrls: ['./validated-distribution.component.scss']
})
export class ValidatedDistributionComponent implements OnInit, DoCheck {

    TEXT = GlobalText.TEXTS;
    entity: object;
    loadingExport = false;
    loadingTransaction = false;
    widthScreen: number;
    heightScreen: number;
    maxWidthMobile = GlobalText.maxWidthMobile;
    language = GlobalText.language;
    selection: SelectionModel<any>;

    @Input() actualDistribution: DistributionData;
    @Input() transactionData: MatTableDataSource<any>;
    @Input() distributionId: number;
    @Input() hasRights = false;

    @Output() exportEmitter: EventEmitter<void> = new EventEmitter();
    @Output() storeEmitter: EventEmitter<void> = new EventEmitter();


    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.checkSize();
    }

    ngOnInit() {
        this.checkSize();
        console.log('Hey daddy');
        console.log(this.actualDistribution);
    }

    ngDoCheck(): void {
        if (this.language !== GlobalText.language) {
            this.language = GlobalText.language;
        }
    }

    constructor(
        private distributionService: DistributionService,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
    ) { }


    // Abstract method
    getAmount(type: string, commodity?: any): number {
        throw new Error('Not implemented function: getAmount()');
    }

    refreshStatuses() {
        this.distributionService.refreshPickup(this.distributionId).subscribe(
            result => {
                if (result) {
                    this.transactionData.data.forEach(
                        (transaction, index) => {
                            if (transaction.state > 0) {
                                result.forEach(
                                    element => {
                                        if (transaction.id === element.id) {
                                            this.transactionData.data[index].updateForPickup(element.moneyReceived);
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    }

    requestLogs() {
        if (this.hasRights) {
            try {
                this.distributionService.logs(this.distributionId).subscribe(
                    e => { this.snackBar.open('' + e, '', { duration: 5000, horizontalPosition: 'center' }); },
                    () => { this.snackBar.open('Logs have been sent', '', { duration: 5000, horizontalPosition: 'center' }); },
                );
            } catch (e) {
                this.snackBar.open('Logs could not be sent : ' + e, '', { duration: 5000, horizontalPosition: 'center' });
            }
        } else {
            this.snackBar.open('Not enough rights to request logs', '', { duration: 5000, horizontalPosition: 'center' });
        }
    }

    getChecked() { }

    storeBeneficiaries() {
        this.storeEmitter.emit();
    }

    exit(message: string) {
        this.snackBar.open(message, '', { duration: 5000, horizontalPosition: 'center' });
        this.dialog.closeAll();
    }

    exportTransaction() {
        this.exportEmitter.emit();
    }

    private checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }
}
