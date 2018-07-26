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
export class CriteriaService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        return of(this.CRITERIA)
        // let url = this.api + "/distributions";
        // return this.http.get(url);
    }

    public CRITERIA = [
        {
            "id": 1,
            "field_string": "disabled",
            "table_string":"vulnerabilityCriteria",
        },
        {
            "id": 2,
            "field_string": "solo parent",
            "table_string":"vulnerabilityCriteria",
        },
        {
            "id": 3,
            "field_string": "lactating",
            "table_string":"vulnerabilityCriteria",
        },
        {
            "id": 4,
            "field_string": "pregnant",
            "table_string":"vulnerabilityCriteria",
        },
        {
            "id": 5,
            "field_string": "nutritional issues",
            "table_string":"vulnerabilityCriteria",
        },
        {
            "id": 1,
            "field_string": "ID Poor",
            "type": "Number",
            "table_string":"countrySpecific",
        },
        {
            "id": 2,
            "field_string": "WASH",
            "type": "Text",
            "table_string":"countrySpecific",
        },
        {
            "field_string": "gender",
            "type": "boolean"
        },
        {
            "field_string": "dateOfBirth",
            "type": "date"
        }
    ] ;
}