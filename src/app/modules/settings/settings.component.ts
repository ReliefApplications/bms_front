import { Component, OnInit } from '@angular/core';
import { DistributionData } from '../../model/distribution-data';
import { DistributionService } from '../../core/api/distribution.service';
import { CacheService } from '../../core/storage/cache.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  selectedTitle = "";
  referedClassToken = DistributionData;
  distributions : MatTableDataSource<DistributionData>;
  isBoxClicked = false;

  constructor(
    public referedClassService: DistributionService,    
    private cacheService: CacheService,
  ) { }

  ngOnInit() {
    this.checkDistributions();
  }

  selectTitle(title): void{
    this.isBoxClicked = true;
    this.selectedTitle = title;
  }

  checkDistributions(): void{
      this.referedClassService.get().subscribe( response => {
        this.distributions = new MatTableDataSource(response);
        this.cacheService.set(CacheService.DISTRIBUTIONS, response);
      })
  }
}
