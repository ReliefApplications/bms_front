import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';
import { CustomModelService } from './custom-model.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends CustomModelService {
  readonly api = URL_BMS_API;

  constructor(
    protected http: HttpService,
  ) {
    super(http);
  }

  public get() {
    const url = this.api + '/products';
    return this.http.get(url);
  }

  public create(body: any) {
    const url = this.api + '/products';
    return this.http.put(url, body);
  }

  public update(id: number, body: any) {
    const url = this.api + '/products/' + id;
    return this.http.post(url, body);
  }

  public delete(id: number) {
    const url = this.api + '/products/' + id;
    return this.http.delete(url);
  }

  public fillWithOptions() {

  }
}
