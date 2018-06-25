import { Component, OnInit } from '@angular/core';
import { DistributionData } from '../../model/distribution-data';
import { DistributionService } from '../../core/api/distribution.service';
import { CacheService } from '../../core/storage/cache.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  selectedTitle = "";
  referedClassToken = DistributionData;
  distributions: DistributionData[];

  constructor(
    public referedClassService: DistributionService,    
    private cacheService: CacheService,
  ) { }

  ngOnInit() {
    this.checkDistributions();
  }

  selectTitle(title){
    this.selectedTitle = title;
  }

  checkDistributions(): void{
      this.referedClassService.get().subscribe( response => {
        this.distributions = response;
        console.log(this.distributions);
        this.cacheService.set(CacheService.DISTRIBUTIONS, this.distributions);
      })
  }
}
