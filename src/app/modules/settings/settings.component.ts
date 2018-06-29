import { Component, OnInit, HostListener } from '@angular/core';
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
  public maxHeight = 700;
  public maxWidthMobile = 750;
  public maxWidthFirstRow = 1000;
  public maxWidthSecondRow = 800;
  public maxWidth = 750;
  public heightScreen;
  public widthScreen;

  constructor(
    public referedClassService: DistributionService,    
    private cacheService: CacheService,
  ) { }

  ngOnInit() {
    this.checkDistributions();
    this.checkSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void{
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
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
