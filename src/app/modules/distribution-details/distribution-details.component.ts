import { Component, OnInit, Input } from '@angular/core';
import { DistributionService } from '../../core/api/distribution.service';

@Component({
  selector: 'app-distribution-details',
  templateUrl: './distribution-details.component.html',
  styleUrls: ['./distribution-details.component.scss']
})
export class DistributionDetailsComponent implements OnInit {

  @Input() distributionId : any;
  
  constructor(
    public distributionService : DistributionService,
  ) { 
  }

  ngOnInit() {
  }

}
