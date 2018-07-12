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

  public referedClassService;
  referedClassToken = Households;
  households : MatTableDataSource<Households>;

  constructor(
    private cacheService: CacheService,
    public householdsService: HouseholdsService,
  ) { }

  //For windows size
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

  /**
   * Get list of all households and display it
   */
  checkHouseholds(): void{
    this.referedClassService = this.householdsService;
    this.referedClassService.get().subscribe( response => {
      response = this.referedClassToken.formatArray(response.json());
      this.households = new MatTableDataSource(response);
      this.cacheService.set('HOUSEHOLDS', response);
    })
  }

  /**
   * Listener and function use in case where windows is resize
   * @param event 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void{
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }


}
