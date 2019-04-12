import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API } from '../../../environments/environment';
import { Beneficiaries } from '../../model/beneficiary';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { CustomModelService } from './custom-model.service';

@Injectable({
  providedIn: 'root'
})
export class BeneficiariesService extends CustomModelService {
  readonly api = URL_BMS_API;
  customModelPath = 'beneficiaries';

  constructor(
    protected http: HttpService
  ) {
    super(http);
  }

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

  public add(distributionId: number, beneficiary: any[]) {
    const url = this.api + '/distributions/' + distributionId + '/beneficiary';
    return this.http.put(url, beneficiary);
  }

  public getAllFromProject(projectId: number, target: string) {
    const body = {'target': target};

    const url = this.api + '/distributions/beneficiaries/project/' + projectId;
    return this.http.post(url, body);
  }

  public import(distributionId: number, file: any, step: number) {
    const url = this.api + '/import/beneficiaries/distribution/' + distributionId + '?step=' + step;
    // step = 1 -> get the comparing tables & step = 2 -> update database.
    return this.http.post(url, file);
  }

  public listApi() {
    const url = this.api + '/import/api/households/list';
    return this.http.get(url);
  }

  public importApi(apiObject: any, project: string) {
    const url = this.api + '/import/api/households/project/' + project;
    return this.http.post(url, apiObject);
  }

  public fillWithOptions(beneficiary: any) {
  }
}
