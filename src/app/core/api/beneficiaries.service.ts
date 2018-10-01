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

  public update(beneficiaryId: number, beneficiary: any) {
      const url = this.api + '/beneficiaries/' + beneficiaryId;
      return this.http.post(url, beneficiary);
  }

  public delete(beneficiaryId: number, distributionId: any) {
    const url = this.api + '/beneficiaries/' + beneficiaryId + '?distribution=' + distributionId;
    return this.http.delete(url);
}

  public getRandom(distributionId, size: number) {
    const url = this.api + '/distributions/' + distributionId + '/random' + '?size=' + size;
    return this.http.get(url);
  }

  public add(distributionId: number, beneficiary: any) {
    const url = this.api + '/distributions/' + distributionId + '/beneficiary';
    // console.log(beneficiary);
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

  public apiName(){
    const url = this.api + '/beneficiaries/import/api/name';
    return this.http.get(url);
  }

  public apiParam(apiObject: any, project: string){
    const url = this.api + '/beneficiaries/import/api/params/' + project;
    return this.http.post(url, apiObject);
  }

  public importApi(apiObject: any, project: string){
    const url = this.api + '/beneficiaries/import/api/' + project;
    return this.http.post(url, apiObject);
  }
}
