import { CollectionViewer } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { AppInjector } from '../app-injector';
import { HouseholdsService } from '../core/api/households.service';
import { LocationService } from '../core/api/location.service';
import { MultipleSelectModelField } from './CustomModel/multiple-select-model-field';
import { NestedFieldModelField } from './CustomModel/nested-field';
import { ObjectModelField } from './CustomModel/object-model-field';
import { CustomDataSource } from './data-source/custom-data-source.interface';
import { Household } from './household';
import { Location } from './location';

export class HouseholdFilters extends CustomModel {
    // TODO: Change apiLabels to get id for API (backend)
    public fields = {
        projects: new MultipleSelectModelField({
            title: this.language.project,
            filterName: 'projects',
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
        vulnerabilities: new MultipleSelectModelField({
            title: this.language.model_vulnerabilities,
            filterName: 'vulnerabilities',
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
        location: new ObjectModelField<Location>({
            title: this.language.location,
            filterName: 'locations'
        }),
        adm1: new NestedFieldModelField({
            title: this.language.adm1,
            filterName: 'locations',
            childrenObject: 'location',
            childrenFieldName: 'adm1',
            apiLabel: 'id',
            isTrigger: true,
            triggerFunction: (householdFilters: HouseholdFilters, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                householdFilters.set('adm2', null);
                householdFilters.set('adm3', null);
                householdFilters.set('adm4', null);
                appInjector.get(LocationService).fillAdm2Options(householdFilters, parseInt(value, 10)).subscribe();
                return householdFilters;
            },
            isDisplayedInTable: true,
        }),
        adm2: new NestedFieldModelField({
            title: this.language.adm2,
            filterName: 'locations',
            childrenObject: 'location',
            childrenFieldName: 'adm2',
            apiLabel: 'id',
            isTrigger: true,
            triggerFunction: (householdFilters: HouseholdFilters, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                householdFilters.set('adm3', null);
                householdFilters.set('adm4', null);
                appInjector.get(LocationService).fillAdm3Options(householdFilters, parseInt(value, 10)).subscribe();
                return householdFilters;
            },
            isDisplayedInTable: true,
        }),
        adm3: new NestedFieldModelField({
            title: this.language.adm3,
            filterName: 'locations',
            childrenObject: 'location',
            childrenFieldName: 'adm3',
            apiLabel: 'id',
            isTrigger: true,
            triggerFunction: (householdFilters: HouseholdFilters, value: string, form: FormGroup) => {
                const appInjector = AppInjector;
                householdFilters.set('adm4', null);
                appInjector.get(LocationService).fillAdm4Options(householdFilters, parseInt(value, 10)).subscribe();
                return householdFilters;
            },
            isDisplayedInTable: true,
        }),
        adm4: new NestedFieldModelField({
            title: this.language.adm4,
            filterName: 'locations',
            childrenObject: 'location',
            childrenFieldName: 'adm4',
            apiLabel: 'id',
            isDisplayedInTable: true,
        })
    };
}
export class HouseholdsDataSource implements CustomDataSource<Household> {

    dataSubject = new BehaviorSubject<Household[]>([]);
    public data$ = this.dataSubject.asObservable();

    loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    lengthSubject = new BehaviorSubject<number>(0);
    public length$ = this.lengthSubject.asObservable();

    constructor(private householdsService: HouseholdsService) {
    }

    connect(_collectionViewer: CollectionViewer): Observable<Household[]> {
        return this.dataSubject.asObservable();
    }

    disconnect(_collectionViewer: CollectionViewer): void {
        this.dataSubject.complete();
        this.loadingSubject.complete();
    }

    loadData(
        filter = [],
        sort = { sort: 'familyName', direction: 'asc' },
        pageIndex = 0,
        pageSize = 50
    ) {
        this.loadingSubject.next(true);

        this.householdsService.get(filter, sort, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => {
                this.loadingSubject.next(false);
            })
        ).subscribe(response => {
            let households: Array<Household> = [];
            if (response) {
                households = response[1].map(household => {
                    return Household.apiToModel(household);
                });
                this.dataSubject.next(households);
                this.lengthSubject.next(response[0]);
            }
        });
    }

    getFilterFields(): HouseholdFilters {
        return new HouseholdFilters();
    }
}
