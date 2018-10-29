import { Injectable } from '@angular/core';
import { Observable, merge, of, fromEvent } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { componentRefresh } from '@angular/core/src/render3/instructions';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

    private CONNECTED : boolean;
    private online$ : Observable<boolean>;

  constructor() {
    this.online$ = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
    )

    this.refreshNetworkStatus();
   }

   refreshNetworkStatus() {
       this.online$.subscribe(
           status => {
               this.CONNECTED = status;
           }
       )
   }

   public getStatus() : boolean {
       return(this.CONNECTED);
   }
}
