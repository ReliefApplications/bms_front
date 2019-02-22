import { Injectable  } from '@angular/core';
import { URL_BMS_API } from '../../../environments/environment';
import { HttpService } from './http.service';


@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  readonly api = URL_BMS_API;

  constructor(private http: HttpService) {}

  public getSummary() {
      const url = this.api + '/summary';
      return this.http.get(url);
  }
}
