import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { URL_BMS_API} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomModelService {
    readonly api = URL_BMS_API;

  constructor(
    private http: HttpService
) {
}

public get(customModelPath: string) {
    const url = `${this.api}/${customModelPath}`;
    return this.http.get(url);
}
}
