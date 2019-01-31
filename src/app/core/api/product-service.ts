import { Injectable } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';

import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  readonly api = URL_BMS_API;

  constructor(
    private http: HttpService,
  ) {
  }

  public get() {
    const url = this.api + "/product";
    return this.http.get(url);
  }

  public update(body) {
    const url = this.api + "/product";
    return this.http.post(url, { name: body["name"], code: body["code"] });
  }
}
