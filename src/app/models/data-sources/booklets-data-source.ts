import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { AppInjector } from '../../app-injector';
import { BookletService } from '../../core/api/booklet.service';
import { CountriesService } from '../../core/countries/countries.service';
import { Booklet } from '../booklet';
import { CustomDataSource } from './custom-data-source.interface';
import { MultipleSelectModelField } from '../custom-models/multiple-select-model-field';

export class BookletFilters extends CustomModel {

    protected countryService = AppInjector.get(CountriesService);

    protected country = this.countryService.selectedCountry.get<string>('id') ?
        this.countryService.selectedCountry.get<string>('id') :
        this.countryService.khm.get<string>('id');

    public fields = {
        currency: new MultipleSelectModelField({
            title: this.language.currency,
            filterName: 'currency',
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
        status: new MultipleSelectModelField({
            title: this.language.status,
            filterName: 'status',
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
        // beneficiary: new MultipleSelectModelField({
        //     title: this.language.beneficiary,
        //     filterName: 'beneficiary',
        //     isDisplayedInTable: true,
        // }),
        distribution: new MultipleSelectModelField({
            title: this.language.distribution,
            filterName: 'distribution',
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
    };
}
export class BookletsDataSource implements CustomDataSource<Booklet> {

    dataSubject = new BehaviorSubject<Booklet[]>([]);
    public data$ = this.dataSubject.asObservable();

    loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    lengthSubject = new BehaviorSubject<number>(0);
    public length$ = this.lengthSubject.asObservable();

    constructor(private bookletService: BookletService) {
    }

    connect(_collectionViewer: CollectionViewer): Observable<Booklet[]> {
        return this.dataSubject.asObservable();
    }

    disconnect(_collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(
        filter = [],
        sort = { sort: null, direction: null },
        pageIndex = 0,
        pageSize = 10
    ) {
        this.loadingSubject.next(true);

        this.bookletService.get(filter, sort, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.loadingSubject.next(false);
            })
        ).subscribe(response => {
            let booklets: Array<Booklet> = [];
            if (response) {
                booklets = response[1].map(booklet => {
                    return Booklet.apiToModel(booklet);
                });
                this.dataSubject.next(booklets);
                this.lengthSubject.next(response[0]);
            }
        });
    }

    getFilterFields(): BookletFilters {
        return new BookletFilters();
    }
}
