import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';
import { Beneficiaries } from '../../model/beneficiary';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariesService {
  readonly api = URL_BMS_API;

  constructor(
    private http: HttpService
  ) { }

  public get(distributionId) {
    const url = this.api + '/distributions/' + distributionId + '/beneficiaries';
    return this.http.get(url);
  }

  public getRandom(distributionId) {
    const url = this.api + '/distributions/' + distributionId + '/random';
    return this.http.get(url);
  }

  public add(distributionId: number, beneficiary: Beneficiaries) {
    const url = this.api + '/distributions/' + distributionId + '/beneficiary';
    return this.http.put(url, beneficiary);
  }

  public getAllFromProject(projectId: number) {
    const url = this.api + '/distributions/beneficiaries/project/' + projectId;
    return this.http.get(url);
  }

  public import(distributionId: number, file: any, step: number) {
    const url = this.api + '/import/beneficiaries/distribution/' + distributionId + '?step=' + step;
    // step = 1 -> get the comparing tables & step = 2 -> update database.
    return this.http.post(url, file);
  }


}
