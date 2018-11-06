import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { Households } from "./households";
import { HouseholdsService } from "../core/api/households.service";

export class HouseholdsDataSource implements DataSource<Households> {

    private householdsSubject = new BehaviorSubject<Households[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private lengthSubject = new BehaviorSubject<number>(0);
    public filter;
    public length$ = this.lengthSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public locations = new BehaviorSubject<any[]>([]);
    public projects = new BehaviorSubject<any[]>([]);
    public vulnerabilities = new BehaviorSubject<any[]>([]);

    constructor(private householdsService: HouseholdsService) {
        this.filter = [{
            filter : [],
            category: 'familyName'
        }];
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

    setCategory(category : String) {
        this.filter.category = category;
    }

    getLoadingState() {
        return this.loading$;
    }
}
