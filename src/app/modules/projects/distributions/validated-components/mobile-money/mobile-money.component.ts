import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';


@Component({
    selector: 'app-mobile-money',
    templateUrl: '../validated-distribution.component.html',
    styleUrls: ['../validated-distribution.component.scss', './mobile-money.component.scss']
})
export class MobileMoneyComponent extends ValidatedDistributionComponent implements OnInit {

    ngOnInit() {
        super.ngOnInit();
    }

    getAmount(type: string, commodity?: any): number {
        return 0;
    }
}
