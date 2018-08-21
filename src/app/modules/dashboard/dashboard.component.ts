import { Component, OnInit, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material';

import { URL_BMS_API } from '../../../environments/environment';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { LeafletService } from '../../core/external/leaflet.service';
import { CacheService } from '../../core/storage/cache.service';
import { DistributionService } from '../../core/api/distribution.service';

import { DistributionData } from '../../model/distribution-data';

import { GlobalText } from '../../../texts/global';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public dashboard = GlobalText.TEXTS;

  users: any;
  referedClassToken = DistributionData;
  distributions: MatTableDataSource<DistributionData>;
  public maxWidthMobile = 750;
  public heightScreen;
  public widthScreen;

  constructor(
    private http: HttpClient,
    private _authenticationService: AuthenticationService,
    private router: Router,
    private serviceMap: LeafletService,
    private cacheService: CacheService,
    public distributionService: DistributionService,

  ) { }

  ngOnInit() {
    let user = this._authenticationService.getUser();
    if (!user.loggedIn) {
      this.router.navigate(['/login']);
    }
    this.serviceMap.createMap('map');
    this.serviceMap.addTileLayer();

    this.checkDistributions();
    this.checkSize();
  }

  /**
   * check if the langage has changed
   */
  ngDoCheck() {
    if (this.dashboard != GlobalText.TEXTS) {
      this.dashboard = GlobalText.TEXTS;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.checkSize();
  }

  checkSize(): void {
    this.heightScreen = window.innerHeight;
    this.widthScreen = window.innerWidth;
  }

  /**
  * get the distributions list to display on dashboard
  * check if it is cached, otherwise get it from the api
  */

  checkDistributions(): void {
    this.distributionService.get().subscribe(response => {
      console.log(response.json());
      this.distributions = new MatTableDataSource(this.referedClassToken.formatArray(response.json()));
      this.cacheService.set(CacheService.DISTRIBUTIONS, response);
    })
  }

}
