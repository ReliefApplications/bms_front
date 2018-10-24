import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { Households } from "./households";
import { HouseholdsService } from "../core/api/households.service";

export class HouseholdsDataSource implements DataSource<Households> {

    private householdsSubject = new BehaviorSubject<Households[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public lengthSubject = new BehaviorSubject<number>(0);
    public filter;
    public loading$ = this.loadingSubject.asObservable();

    constructor(private householdsService: HouseholdsService) {
        this.filter = {
            filter : '',
            filtered: 'familyName'
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<Households[]> {
        return this.householdsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.householdsSubject.complete();
        this.loadingSubject.complete();
    }

    loadHouseholds(
      filter = {},
      sort = {sort: 'familyName', direction: 'asc'},
      pageIndex = 0,
      pageSize = 50
    ) {
        this.loadingSubject.next(true);
        this.householdsService.get(filter, sort, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        )
        .subscribe(response => {
          let households = Households.formatArray(response[1]);
          this.householdsSubject.next(households);
          this.lengthSubject.next(response[0]);
        });
    }

    setFiltered(filtered : String) {
        this.filter.filtered = filtered; 
    }
    
    setFilter(filter : String) {
        this.filter.filter = filter; 
    }

    getLoadingState() {
        return this.loading$;
    }
}
