import { Component, OnInit                  } from '@angular/core';
import { HttpClient                         } from '@angular/common/http';
import { Router                             } from '@angular/router';

import { URL_BMS_API                        } from '../../../environments/environment';
import { AuthenticationService              } from '../../core/authentication/authentication.service';
import { LeafletService                     } from '../../core/external/leaflet.service';
import { CacheService                       } from '../../core/storage/cache.service';

import { DistributionData                   } from '../../model/distribution-data';
import { DistributionService } from '../../core/api/distribution.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: any;
  referedClassToken = DistributionData;
  distributions: DistributionData[];

  constructor(
      private http: HttpClient,
      private _authenticationService: AuthenticationService,
      private router : Router,
      private serviceMap: LeafletService, 
      private cacheService: CacheService,
      private distributionService: DistributionService  
  ) { }

  ngOnInit() {
    let user = this._authenticationService.getUser();
    if (!user.loggedIn) {
      this.router.navigate(['/login']);
    }
    this.serviceMap.createMap('map');
    this.serviceMap.addTileLayer();

    this.checkDistributions();
  }

  
  checkDistributions(){
    // let distributions = this.cacheService.get(CacheService.DISTRIBUTIONS);

    // if(!distributions){
      this.distributionService.get().subscribe( response => {
        this.distributions = response;
        this.cacheService.set(CacheService.DISTRIBUTIONS, this.distributions);
      })
    // } else {
      // this.distributions = distributions;
    // }
  }

}
