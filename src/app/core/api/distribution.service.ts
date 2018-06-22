import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

import { DistributionData                           } from '../../model/distribution-data';
import { Project                                    } from '../../model/project';
import { Location                                   } from '../../model/location';
import { Sector                                     } from '../../model/sector';

@Injectable({
	providedIn: 'root'
})
export class DistributionService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){}

    public get() {
        let url = this.api + "/distribution";
        return of(DISTRIBUTIONS);
        //return this.http.get(url);
    }
}

//en attendant d'avoir la route pour getter les distributions
const DISTRIBUTIONS: DistributionData[] = [
    new DistributionData({name: 'Distribution1', project: new Project({sector: new Sector({name: 'hhh'})}) , location:new Location({adm1:"Phnom Penh"})}),
    new DistributionData({name: 'Distribution2', project: new Project({sector: new Sector({name: 'cchhh'})}) , location:new Location({adm1:"Udong"})}),
    new DistributionData({name: 'Distribution3', project: new Project({sector: new Sector({name: 'cchhh'})}) , location:new Location({adm1:"Kompong Luong"})}),
    new DistributionData({name: 'Distribution4', project: new Project({sector: new Sector({name: 'cchhh'})}) , location:new Location({adm1:"Kratie"})}),
    new DistributionData({name: 'Distribution5', project: new Project({sector: new Sector({name: 'cchhh'})}) , location:new Location({adm1:"Battambang"})})
  ];