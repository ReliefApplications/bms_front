import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariesService {
  readonly api = URL_BMS_API;

  constructor(
    private http : HttpService
  ) { }

  public get(distributionId) {
    let url = this.api + "/distributions/" + distributionId + "/beneficiaries";
    return this.http.get(url);
  }
}
