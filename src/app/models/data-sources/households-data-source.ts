import { CollectionViewer } from '@angular/cdk/collections';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CountriesService } from '../../core/countries/countries.service';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { AppInjector } from '../../app-injector';
import { HouseholdsService } from '../../core/api/households.service';
import { LocationService } from '../../core/api/location.service';
import { MultipleSelectModelField } from '../custom-models/multiple-select-model-field';
import { NestedFieldModelField } from '../custom-models/nested-field';
import { ObjectModelField } from '../custom-models/object-model-field';
import { SingleSelectModelField } from '../custom-models/single-select-model-field';
import { Household } from '../household';
import { Location } from '../location';
import { CustomDataSource } from './custom-data-source.interface';
import { BeneficiaryReferralType } from '../beneficiary';

export class HouseholdFilters extends CustomModel {

    protected countryService = AppInjector.get(CountriesService);

    // TO DO: stop duplicating that (in location.ts and vendor.ts too) once the location structure is stable
    // (cannot put it in customModel because of circular dependency with country.ts)
    // Maybe create an intermediary customModel->customModelWithLocation->householdFilters
    protected country = this.countryService.selectedCountry.getValue().get<string>('id') ?
    this.countryService.selectedCountry.getValue().get<string>('id') :
    this.countryService.khm.get<string>('id');

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
        gender: new SingleSelectModelField({
            title: this.language.gender,
            filterName: 'gender',
            bindField: 'name',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
        residency: new MultipleSelectModelField({
            title: this.language.model_residencystatus,
            filterName: 'residency',
            isDisplayedInTable: true,
            bindField: 'name',
            apiLabel: 'id',
        }),
        livelihood: new MultipleSelectModelField({
            title: this.language.add_beneficiary_getOccupation,
            filterName: 'livelihood',
            isDisplayedInTable: true,
            bindField: 'name',
            apiLabel: 'id',
        }),
        location: new ObjectModelField<Location>({
            title: this.language.location,
            filterName: 'locations'
        }),
        adm1: new NestedFieldModelField({
            title: this.language.adm1[this.country],
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
            title: this.language.adm2[this.country],
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
            title: this.language.adm3[this.country],
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
            title: this.language.adm4[this.country],
            filterName: 'locations',
            childrenObject: 'location',
            childrenFieldName: 'adm4',
            apiLabel: 'id',
            isDisplayedInTable: true,
        }),
        referralType: new MultipleSelectModelField({
            title: this.language.beneficiaries_referral_type,
            filterName: 'referral',
            isDisplayedInTable: true,
            bindField: 'name',
            apiLabel: 'id',
            options: [
                new BeneficiaryReferralType('1', this.language.beneficiaries_referral_types['1']),
                new BeneficiaryReferralType('2', this.language.beneficiaries_referral_types['2']),
                new BeneficiaryReferralType('3', this.language.beneficiaries_referral_types['3']),
                new BeneficiaryReferralType('4', this.language.beneficiaries_referral_types['4']),
                new BeneficiaryReferralType('5', this.language.beneficiaries_referral_types['5']),
            ],
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
        sort = { sort: null, direction: null },
        pageIndex = 0,
        pageSize = 10
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
