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
    ){
    }

    public get() {
        let url = this.api + "/distribution";
        return of(DISTRIBUTIONS);
        //return this.http.get(url);
    }
}

//fake distributions en attendant d'avoir la route pour getter les distributions
const DISTRIBUTIONS: DistributionData[] = [
    new DistributionData({name: 'Distribution1', sector: 'logistics' , location:"Phnom Penh"}),
    new DistributionData({name: 'Distribution2', sector: 'protection' , location:"Udong"}),
    new DistributionData({name: 'Distribution3', sector: 'shelter', location:"Kompong Luong"}),
    new DistributionData({name: 'Distribution4',  sector: 'logistics' , location:"Kratie"}),
    new DistributionData({name: 'Distribution5', sector: 'shelter', location:"Kratie"}),
    new DistributionData({name: 'Distribution6', sector: 'shelter' , location:"Kratie"}),
   ];