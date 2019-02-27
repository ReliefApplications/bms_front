import { Component, OnInit } from '@angular/core';
import { ValidatedDistributionComponent } from '../validated-distribution.component';

@Component({
  selector: 'app-general-relief',
  templateUrl: '../validated-distribution.component.html',
  styleUrls: ['../validated-distribution.component.scss', './general-relief.component.scss']
})
export class GeneralReliefComponent extends ValidatedDistributionComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
  }

  getAmount(type: string, commodity?: any) {
    return 0;
  }

}
