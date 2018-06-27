import { Component, OnInit, HostListener } from '@angular/core';
import { DistributionData } from '../../model/distribution-data';
import { DistributionService } from '../../core/api/distribution.service';
import { CacheService } from '../../core/storage/cache.service';
import { MatTableDataSource } from '@angular/material';
import { Donor } from '../../model/donor';
import { DonorService } from '../../core/api/donor.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  selectedTitle = "";
  isBoxClicked = false;

  public referedClassService; 
  referedClassToken;
  data : MatTableDataSource<any>;
  
  public maxHeight = 700;
  public maxWidthMobile = 750;
  public maxWidthFirstRow = 1000;
  public maxWidthSecondRow = 800;
  public maxWidth = 750;
  public heightScreen;
  public widthScreen;

  constructor(
    public distributionService: DistributionService,    
    public donorService: DonorService,    
    private cacheService: CacheService,
  ) { }

  ngOnInit() {
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
    this.getData(title);
    this.isBoxClicked = true;
    this.selectedTitle = title;
  }

 

  getData(title){
    switch(title){
      case 'users':
        // this.referedClassToken = User;
        // this.referedClassService = userService;
        // this.checkUsers();
        // break;
      case 'donors':
        this.referedClassToken = Donor;
        this.referedClassService = this.donorService;
        break;
      default: break;
    }
      this.load(title);
  }

  load(title): void{
    this.referedClassService.get().subscribe( response => {
      response = this.referedClassToken.formatArray(response.json());
      this.cacheService.set((<typeof CacheService>this.cacheService.constructor)[this.referedClassToken.__classname__.toUpperCase() + "S"], response);
      this.data = new MatTableDataSource(response);        
    })
  }
}
