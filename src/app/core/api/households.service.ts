import { Injectable                                 } from '@angular/core';
import { of                                         } from 'rxjs';

import { URL_BMS_API                                } from '../../../environments/environment';

import { HttpService                                } from './http.service';

import { Households                                 } from '../../model/households';
import { Project                                    } from '../../model/project';
import { Location                                   } from '../../model/location';
import { Sector                                     } from '../../model/sector';


@Injectable({
	providedIn: 'root'
})
export class HouseholdsService{
    readonly api = URL_BMS_API;

    constructor(
        private http : HttpService
    ){
    }

    public get() {
        let url = this.api + "/households";
        return of(HOUSEHOLDS);
        //return this.http.get(url);
    }
}

//fake distributions en attendant d'avoir la route pour getter les distributions
const HOUSEHOLDS: Households[] = [
    new Households({id: '1', familyName: 'familyName1', firstName: 'firstName1', location: 'location1', dependents: 4, vulnerabilities: 'assets/images/households/lactating.png'}),
    new Households({id: '2', familyName: 'familyName2', firstName: 'firstName2', location: 'location2', dependents: 3, vulnerabilities: 'assets/images/households/disabled.png'}),
    new Households({id: '3', familyName: 'familyName3', firstName: 'firstName3', location: 'location3', dependents: 3, vulnerabilities: 'assets/images/households/solo-parent.png'}),
    new Households({id: '4', familyName: 'familyName4', firstName: 'firstName4', location: 'location4', dependents: 7, vulnerabilities: 'assets/images/households/pregnant.png'}),
    new Households({id: '5', familyName: 'familyName5', firstName: 'firstName5', location: 'location5', dependents: 1, vulnerabilities: 'assets/images/households/nutritional-issues.png'}),

   ];