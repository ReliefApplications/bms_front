import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomModel } from '../CustomModel/custom-model';

export interface CustomDataSource<T> extends DataSource<T> {

    dataSubject: BehaviorSubject<T[]>;
    data$: Observable<T[]>;

    loadingSubject: BehaviorSubject<boolean>;
    loading$: Observable<boolean>;

    lengthSubject: BehaviorSubject<number>;
    length$: Observable<number>;

    loadData(filter?: Object, sort?: Object, pageIndex?: number, pageSize?: number);

    getFilterFields(): CustomModel;
}
