import { Component, OnInit, Input } from '@angular/core';
import { GlobalText } from '../../../../../texts/global';

@Component({
  selector: 'app-mobile-money',
  templateUrl: './mobile-money.component.html',
  styleUrls: ['./mobile-money.component.scss']
})
export class MobileMoneyComponent implements OnInit {
TEXT = GlobalText.TEXTS;
@Input() actualDistribution;

  constructor() { }

  ngOnInit() {
    console.log(this.actualDistribution);
  }

  /**
   * Calculate commodity distribution quantities & values.
   */
  getAmount(type: string, commodity?: any): number {

      let amount: number;

      if (!this.transactionData) {
          amount = 0;
      } else if (type === 'people') {
          amount = 0;
          this.transactionData.data.forEach(
              element => {
                  if (element.state === -1 || element.state === -2 || element.state === 0) {
                      amount++;
                  }
              }
          );
      } else if (commodity) {

          if (type === 'total') {
              amount = commodity.value * this.transactionData.data.length;
          } else if (type === 'sent') {
              amount = 0;
              this.transactionData.data.forEach(
                  element => {
                      if (element.state === 1 || element.state === 2 || element.state === 3) {
                          amount += commodity.value;
                      }
                  }
              );
          } else if (type === 'received') {
              amount = 0;
              this.transactionData.data.forEach(
                  element => {
                      if (element.state === 3) {
                          amount += commodity.value;
                      }
                  }
              );
          } else if (type === 'ratio') {
              let done = 0;
              this.transactionData.data.forEach(
                  element => {
                      if (element.state === 1 || element.state === 2 || element.state === 3) {
                          done += commodity.value;
                      }
                  }
              );
              amount = Math.round((done / (commodity.value * this.transactionData.data.length)) * 100);
          }
      }
      return (amount);
  }

}
