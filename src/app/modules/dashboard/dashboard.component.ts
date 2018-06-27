import { Component, OnInit                  } from '@angular/core';
import { HttpClient                         } from '@angular/common/http';
import { Router                             } from '@angular/router';
import { MatTableDataSource                 } from '@angular/material';

import { URL_BMS_API                        } from '../../../environments/environment';
import { AuthenticationService              } from '../../core/authentication/authentication.service';
import { LeafletService                     } from '../../core/external/leaflet.service';
import { CacheService                       } from '../../core/storage/cache.service';
import { DistributionService                } from '../../core/api/distribution.service';

import { DistributionData                   } from '../../model/distribution-data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  users: any;
  referedClassToken = DistributionData;
  distributions : MatTableDataSource<DistributionData>;

  constructor(
      private http: HttpClient,
      private _authenticationService: AuthenticationService,
      private router : Router,
      private serviceMap: LeafletService, 
      private cacheService: CacheService,
      public referedClassService: DistributionService,

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

  /**
  * get the distributions list to display on dashboard
  * check if it is cached, otherwise get it from the api
  */
 checkDistributions(): void{
  this.referedClassService.get().subscribe( response => {
    this.distributions = new MatTableDataSource(response);
    this.cacheService.set(CacheService.DISTRIBUTIONS, response);
  })
}

}
