import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { SelectionModel } from '@angular/cdk/collections';
import { TransactionQRVoucher } from 'src/app/model/transaction-qr-voucher.new';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { MatTableDataSource } from '@angular/material';
import { Commodity } from 'src/app/model/commodity.new';
import { BookletStatus } from 'src/app/model/booklet.new';
import { TransactionTableComponent } from 'src/app/components/table/transaction-table/transaction-table.component';
import { Booklet } from 'src/app/model/booklet.new';
import { ModalAssignComponent } from 'src/app/components/modals/modal-assign/modal-assign.component';

@Component({
  selector: 'app-qr-voucher',
  templateUrl: './qr-voucher.component.html',
  styleUrls: ['../validated-distribution.component.scss']
})
export class QrVoucherComponent extends ValidatedDistributionComponent implements OnInit {
    // checkedLines: any[] = [];
    // distributed = false;
    loadingAssign = false;
    // beneficiaries = [];
    // beneficiariesClass = Beneficiary;

    transactionData: MatTableDataSource<TransactionQRVoucher>;

    ngOnInit() {
        super.ngOnInit();
        // this.selection = new SelectionModel<any>(true, []);
        this.entity = TransactionQRVoucher;
    }

    setDistributionBeneficiaries(distributionBeneficiaries: any) {
      this.actualDistribution.set(
          'distributionBeneficiaries',
          distributionBeneficiaries
              .map((distributionBeneficiariy: any) => TransactionQRVoucher.apiToModel(distributionBeneficiariy)));
  }

  formatTransactionTable() {
      const distributionBeneficiaries = this.actualDistribution.get<TransactionQRVoucher[]>('distributionBeneficiaries');
      this.transactionData = new MatTableDataSource(distributionBeneficiaries);
      this.verifiyIsFinished();
      this.loadingTransaction = false;
  }

   /**
   * To be used everytime transactionData changes
   */
  verifiyIsFinished() {
      let amount: number;

      if (!this.transactionData) {
          amount = 0;
      } else {
          amount = 0;
          this.transactionData.data.forEach(
              (distributionBeneficiary: TransactionQRVoucher) => {
                if (!distributionBeneficiary.get('booklet')) {
                  amount++;
                } else {
                  const stateId = distributionBeneficiary.get('booklet').get<BookletStatus>('status').get<string>('id');
                  if (stateId !== '3' && stateId !== '2') {
                      amount++;
                  }
                }
              }
          );
      }
       if (amount === 0) {
          this.finishedEmitter.emit();
       }
  }

  // getChecked(event: any) {
  //     this.checkedLines = event;
  // }


  // Total ammount assigned/distributed to a benefeciary
  getCommoditySentAmountFromBeneficiary(commodity: any, transaction: TransactionQRVoucher): number {
      const booklet: Booklet = transaction.get('booklet');
      if (booklet) {
          return booklet.get('value');
      } else {
          return 0;
      }
  }

  // Total amount used/spent by a beneficiary
  getCommodityReceivedAmountFromBeneficiary(commodity: any, transaction: TransactionQRVoucher): number {
      const booklet: Booklet = transaction.get('booklet');
      if (booklet && (booklet.get('status').get<string>('id') === '2' || booklet.get('status').get<string>('id') === '3')) {
          return booklet.get('value');
      } else {
          return 0;
      }
  }

  /**
	* open each modal dialog
	*/
  openModal(dialogDetails: any): void {
    // Can only be a modalDetails
    this.modalService.openDialog(TransactionQRVoucher, this.beneficiariesService, dialogDetails);
    this.modalService.isCompleted.subscribe(() => {
    });
  }

  print(element: TransactionQRVoucher) {
    return this._exportService.printVoucher(element.get('booklet').get('id'));
  }

  assign(element: TransactionQRVoucher) {
    const dialogRef = this.dialog.open(ModalAssignComponent, {
        data: {
            beneficiary: element.get('beneficiary'),
            project: this.actualDistribution.get('project'),
            distribution: this.actualDistribution,
        }
    });
    dialogRef.afterClosed().subscribe((test) => {
      this.getDistributionBeneficiaries();
    });
  }

  openAssignDialog() {
      this.loadingAssign = true;

      this.distributionService.getAssignableBeneficiaries(this.actualDistribution.get('id'))
          .subscribe(
              response => {
                  this.loadingAssign = false;
                  let beneficiaries = [];
                  if (response || response === []) {
                      // this.beneficiaries = this.beneficiariesClass.formatArray(response);
                      beneficiaries = response
                            .map((distributionBeneficiary: any) => Beneficiary.apiToModel(distributionBeneficiary.beneficiary));
                  }
                  const dialogRef = this.dialog.open(ModalAssignComponent, {
                      data: {
                          project: this.actualDistribution.get('project'),
                          distribution: this.actualDistribution,
                          beneficiaries: beneficiaries
                      }
                  });

                  dialogRef.afterClosed().subscribe((test) => {
                    this.getDistributionBeneficiaries();
                  });
              }, err => {
                  this.loadingAssign = false;
              }
          );
  }
}
