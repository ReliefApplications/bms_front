import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';
import { TransactionVoucher } from 'src/app/model/transaction-voucher';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-general-relief',
  templateUrl: '../validated-distribution.component.html',
  styleUrls: ['../validated-distribution.component.scss', './general-relief.component.scss']
})
export class GeneralReliefComponent extends ValidatedDistributionComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    this.selection = new SelectionModel<any>(true, []);
    this.entity = TransactionVoucher;
  }

}
