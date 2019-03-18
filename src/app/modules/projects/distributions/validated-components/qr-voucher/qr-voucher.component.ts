import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { SelectionModel } from '@angular/cdk/collections';
import { TransactionVoucher } from 'src/app/model/transaction-voucher';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';
import { Beneficiaries } from 'src/app/model/beneficiary';

@Component({
  selector: 'app-qr-voucher',
  templateUrl: './qr-voucher.component.html',
  styleUrls: ['../validated-distribution.component.scss']
})
export class QrVoucherComponent extends ValidatedDistributionComponent implements OnInit {
    checkedLines: any[] = [];
    distributed = false;
    loadingAssign = false;
    beneficiaries = [];
    beneficiariesClass = Beneficiaries;
    @Output() reloadTable = new EventEmitter<string>();


    ngOnInit() {
        super.ngOnInit();
        this.selection = new SelectionModel<any>(true, []);
        this.entity = TransactionVoucher;
    }

    getChecked(event: any) {
        this.checkedLines = event;
    }


    // Total ammount assigned/distributed to a benefeciary
    getCommoditySentAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        const booklet = beneficiary.booklet;
        if (booklet) {
            return this.entity.getBookletTotalValue(booklet);
        } else {
            return 0;
        }
    }

    // Total amount used/spent by a beneficiary
    getCommodityReceivedAmountFromBeneficiary(commodity: any, beneficiary: any): number {
        const booklet = beneficiary.booklet;
        if (booklet && booklet.status > 1) {
            return this.entity.getBookletTotalValue(booklet);
        } else {
            return 0;
        }
    }

    openAssignDialog() {
        this.loadingAssign = true;

        this.distributionService.getAssignableBeneficiaries(this.actualDistribution.id)
            .subscribe(
                response => {
                    this.loadingAssign = false;
                    if (response || response === []) {
                        this.beneficiaries = this.beneficiariesClass.formatArray(response);
                    } else {
                        this.beneficiaries = [];
                    }
                    const dialogRef = this.dialog.open(ModalAssignComponent, {
                        data: {
                            project: this.actualDistribution.project,
                            distribution: this.actualDistribution,
                            beneficiaries: this.beneficiaries
                        }
                    });

                    dialogRef.afterClosed().subscribe((test) => {
                        this.reloadTable.emit();
                    });
                }, err => {
                    this.loadingAssign = false;
                }
            );
    }

    emitReloadTable() {
        this.reloadTable.emit();
    }
}
