import { Component, OnInit, HostListener } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { CacheService } from '../../core/storage/cache.service';
import { Households } from '../../model/households';
import { HouseholdsService } from '../../core/api/households.service';

@Component({
  selector: 'app-households',
  templateUrl: './households.component.html',
  styleUrls: ['./households.component.scss']
})
export class HouseholdsComponent implements OnInit {


  referedClassToken = Households;
  households : MatTableDataSource<Households>;

  constructor(
    private cacheService: CacheService,
    public referedClassService: HouseholdsService,
  ) { }

  
  public maxHeight = 700;
  public maxWidthMobile = 750;
  public maxWidthFirstRow = 1000;
  public maxWidthSecondRow = 800;
  public maxWidth = 750;
  public heightScreen;
  public widthScreen;

  ngOnInit() {
    this.checkSize();
    this.checkHouseholds();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void{
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  checkHouseholds(): void{
    this.referedClassService.get().subscribe( response => {
      this.households = new MatTableDataSource(response);
      this.cacheService.set(CacheService.HOUSEHOLDS, response);
    })
  }


}
