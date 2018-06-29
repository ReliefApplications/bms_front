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
    new DistributionData({id: "1", name: 'Distribution1', sector: 'logistics' , location:"Phnom Penh"}),
    new DistributionData({id: "2",name: 'Distribution2', sector: 'protection' , location:"Udong"}),
    new DistributionData({id: "3",name: 'Distribution3', sector: 'shelter', location:"Kompong Luong"}),
    new DistributionData({id: "4",name: 'Distribution4',  sector: 'logistics' , location:"Kratie"}),
    new DistributionData({id: "5",name: 'Distribution5', sector: 'shelter', location:"Kratie"}),
    new DistributionData({id: "6",name: 'Distribution6', sector: 'shelter' , location:"Kratie"}),
   ];