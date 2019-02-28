import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { Households } from "./households";
import { HouseholdsService } from "../core/api/households.service";

export class HouseholdsDataSource implements DataSource<Households> {

    private householdsSubject = new BehaviorSubject<Households[]>([]);
    private lengthSubject = new BehaviorSubject<number>(0);
    public filter;
    public length$ = this.lengthSubject.asObservable();
    public loading = true;
    public adm1 = new BehaviorSubject<any[]>(null);
    public adm2 = new BehaviorSubject<any[]>(null);
    public adm3 = new BehaviorSubject<any[]>(null);
    public adm4 = new BehaviorSubject<any[]>(null);
    public projects = new BehaviorSubject<any[]>([]);
    public vulnerabilities = new BehaviorSubject<any[]>([]);

    constructor(private householdsService: HouseholdsService) {
        this.filter = [];
    }

    connect(collectionViewer: CollectionViewer): Observable<Households[]> {
        return this.householdsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.householdsSubject.complete();
    }

    loadHouseholds(
        filter = {},
        sort = { sort: 'familyName', direction: 'asc' },
        pageIndex = 0,
        pageSize = 50
    ) {
        this.loading = true;
        this.householdsService.get(filter, sort, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.loading = false
            })
        )
            .subscribe(response => {
                let households = [];
                if(response) {
                    households = Households.formatArray(response[1]);
                    this.householdsSubject.next(households);
                    this.lengthSubject.next(response[0]);
            }

                
            });
    }

    setCategory(category : String) {
        this.filter.category = category;
    }

    getLoadingState() {
        return this.loading;
    }
}
