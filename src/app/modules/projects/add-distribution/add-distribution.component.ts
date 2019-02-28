import { Component, OnInit, HostListener, DoCheck } from '@angular/core';
import { MatDialog, MatTableDataSource, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';

import { GlobalText } from '../../../../texts/global';

import { Mapper } from '../../../core/utils/mapper.service';
import { CriteriaService } from '../../../core/api/criteria.service';

import { Commodity } from '../../../model/commodity';
import { Criteria } from '../../../model/criteria';
import { DistributionData } from '../../../model/distribution-data';

import { ModalAddLineComponent } from '../../../components/modals/modal-add/modal-add-line/modal-add-line.component';
import { ModalAddComponent } from '../../../components/modals/modal-add/modal-add.component';
import { FormControl, Validators } from '@angular/forms';
import { LocationService } from '../../../core/api/location.service';
import { Project } from '../../../model/project';
import { DistributionService } from '../../../core/api/distribution.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { Observable } from 'rxjs';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { ProjectService } from 'src/app/core/api/project.service';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { CustomDateAdapter, APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';

@Component({
    selector: 'app-add-distribution',
    templateUrl: './add-distribution.component.html',
    styleUrls: ['./add-distribution.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class AddDistributionComponent implements OnInit, DoCheck, DesactivationGuarded {
    public nameComponent = 'add_project_title';
    public distribution = GlobalText.TEXTS;
    public language = GlobalText.language;
    public newObject: any;
    mapperObject = null;
    public properties: any;
    public propertiesTypes: any;
    entity = DistributionData;

    public criteriaClass = Criteria;
    public criteriaAction = 'addCriteria';
    public criteriaArray = [];
    public criteriaData = new MatTableDataSource([]);
    public criteriaNbBeneficiaries = 0;
    public load = false;

    public commodityClass = Commodity;
    public commodityAction = 'addCommodity';
    public commodityArray = [];
    public commodityData = new MatTableDataSource([]);
    public commodityNb: number[] = [];

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    public queryParams;
    public controls = new FormControl();
    public controlNumber = new FormControl('', [Validators.pattern('[0-9]*'), Validators.required]);

    public loadedData: any = [];
    public loadingCreation: boolean;
    public projectInfo: any = { startDate: '', endDate: '' };

    // Save adm ids for requests.
    lastAdm1;
    lastAdm2;
    lastAdm3;

    step = '';

    constructor(
        public mapper: Mapper,
        public dialog: MatDialog,
        private router: Router,
        private criteriaService: CriteriaService,
        private route: ActivatedRoute,
        private cacheService: AsyncacheService,
        private locationService: LocationService,
        private _distributionService: DistributionService,
        private _projectService: ProjectService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.loadingCreation = false;
        this.newObject = Object.create(this.entity.prototype);
        this.newObject.constructor.apply(this.newObject);
        this.mapperObject = this.mapper.findMapperObject(this.entity);
        this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
        this.propertiesTypes = this.newObject.getTypeProperties(this.newObject);
        this.checkSize();
        this.getQueryParameter();
        this.loadProvince();
        this.newObject.type = 'Household';
        this.getProjectDates();
    }

    /**
    * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
    */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.newObject && !this.loadingCreation) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }

    /**
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this.locationService.getAdm1().subscribe(response => {
            this.loadedData.adm1 = response;

        });
        this.loadedData.adm2 = [];
        this.loadedData.adm3 = [];
        this.loadedData.adm4 = [];
    }

    selectDate(event) {
        if (event.value) {
            this.newObject.date_distribution = event.value.toLocaleDateString();
        } else {
            this.snackBar.open(this.distribution.add_distribution_check_date, '', { duration: 5000, horizontalPosition: 'center' });
        }
    }

    /**
     *  Get adm2 from the back or from the cache service with the key ADM2
     * @param adm1
     */
    loadDistrict(adm1$) {
        adm1$.pipe(
            switchMap(
                (value) => {
                    const body = {
                        adm1: value
                    };
                    return this.locationService.getAdm2(body);
                }
            )
        ).subscribe(response => {
            this.loadedData.adm2 = response;
            this.loadedData.adm3 = [];
            this.loadedData.adm4 = [];
        });
    }

    /**
     * Get adm3 from the back or from the cahce service with the key ADM3
     * @param adm2
     */
    loadCommunity(adm2$) {
        adm2$.pipe(
            switchMap(
                (value) => {
                    const body = {
                        adm2: value
                    };
                    return this.locationService.getAdm3(body);
                }
            )
        ).subscribe(response => {
            this.loadedData.adm3 = response;
            this.loadedData.adm4 = [];
        });
    }

    /**
     *  Get adm4 from the back or from the cahce service with the key ADM4
     * @param adm3
     */
    loadVillage(adm3$) {
        adm3$.pipe(
            switchMap(
                (value) => {
                    const body = {
                        adm3: value
                    };
                    return this.locationService.getAdm4(body);
                }
            )
        ).subscribe(response => {
            this.loadedData.adm4 = response;
        });
    }

    /**
     * Check which adm is selected to load the list of adm link to it
     * fro example : if adm1 (province) selected load adm2
     * @param index
     */
    selected(index) {
        let adm$;
        if (index === 'adm1') {
            adm$ = this.getAdmID('adm1');
            this.loadDistrict(adm$);
        } else if (index === 'adm2') {
            adm$ = this.getAdmID('adm2');
            this.loadCommunity(adm$);
        } else if (index === 'adm3') {
            adm$ = this.getAdmID('adm3');
            this.loadVillage(adm$);
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.checkSize();
    }

    checkSize(): void {
        this.heightScreen = window.innerHeight;
        this.widthScreen = window.innerWidth;
    }

    /**
     * get the parameter in the route
     * use to get the active project
     */
    getQueryParameter() {
        this.route.queryParams.subscribe(params => this.queryParams = params);
    }

    /**
     * check if the langage has changed
     */
    ngDoCheck() {
        if (this.distribution !== GlobalText.TEXTS) {
            this.distribution = GlobalText.TEXTS;
            this.language = GlobalText.language;
            this.mapperObject = this.mapper.findMapperObject(this.entity);
            this.nameComponent = GlobalText.TEXTS.distributions;
            this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
        }
    }

    /**
     * to cancel the creation of distribution and go back in the distribution page
     */
    cancel() {
        this.router.navigate(['projects']);
    }

    /**
     * Get the distribution type choosen by the user and refresh the research
     */
    typeDistributionOnChange(event) {
        this.newObject.type = event.value;

        if (this.criteriaArray.length !== 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(
                this.newObject.type,
                this.criteriaArray,
                this.newObject.threshold,
                this.queryParams.project
            ).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                if (this.commodityArray.length > 0) {
                    this.commodityNb = [];
                    this.commodityArray.forEach(commodity => {
                        this.commodityNb.push(commodity.value * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;

            });
        }
    }

    /**
     * Get the number input inserted by the user
     */
    numberOnInput(event) {
        this.newObject.threshold = event.target.value;
    }

    /**
     * Refresh the research when input changed
     */
    numberOnChange() {
        if (this.criteriaArray.length !== 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(
                this.newObject.type,
                this.criteriaArray,
                this.newObject.threshold,
                this.queryParams.project
            ).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                if (this.commodityArray.length > 0) {
                    this.commodityNb = [];
                    this.commodityArray.forEach(commodity => {
                        this.commodityNb.push(commodity.value * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;
            });
        }
    }

    /**
     * Get in the cache service the name of all adm selected
     * @param adm
     */
    getAdmID(adm: string) {
        return new Observable(
            observer => {
                const body = {};
                if (adm === 'adm1') {
                    this.locationService.getAdm1().subscribe(
                        result => {
                            const adm1 = result;
                            if (this.newObject.adm1) {
                                for (let i = 0; i < adm1.length; i++) {
                                    if (adm1[i].name === this.newObject.adm1) {
                                        this.lastAdm1 = adm1[i].id;
                                        observer.next(adm1[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                } else if (adm === 'adm2') {
                    body['adm1'] = this.lastAdm1;
                    this.locationService.getAdm2(body).subscribe(
                        result => {
                            const adm2 = result;
                            if (this.newObject.adm2) {
                                for (let i = 0; i < adm2.length; i++) {
                                    if (adm2[i].name === this.newObject.adm2) {
                                        this.lastAdm2 = adm2[i].id;
                                        observer.next(adm2[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                } else if (adm === 'adm3') {
                    body['adm2'] = this.lastAdm2;
                    this.locationService.getAdm3(body).subscribe(
                        result => {
                            const adm3 = result;
                            if (this.newObject.adm3) {
                                for (let i = 0; i < adm3.length; i++) {
                                    if (adm3[i].name === this.newObject.adm3) {
                                        this.lastAdm3 = adm3[i].id;
                                        observer.next(adm3[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                } else if (adm === 'adm4') {
                    body['adm3'] = this.lastAdm3;
                    this.locationService.getAdm4(body).subscribe(
                        result => {
                            const adm4 = result;
                            if (this.newObject.adm4) {
                                for (let i = 0; i < adm4.length; i++) {
                                    if (adm4[i].name === this.newObject.adm4) {
                                        observer.next(adm4[i].id);
                                        observer.complete();
                                    }
                                }
                            }
                        }
                    );
                }
            }
        );
    }

    getNameProject(id): Observable<string> {
        return this._projectService.get().pipe(
            map(
                result => {
                    const projects = result;
                    let name = '';

                    projects.forEach(element => {
                        if (element.id === id) {
                            name = element.name;
                        }
                    });
                    return name;
                }
            )
        );
    }

    /**
     * create the new distribution object before send it to the back
     */
    add() {
        if (this.newObject.type && this.criteriaArray && this.criteriaArray.length !== 0 &&
          this.commodityArray && this.commodityArray[0] && this.newObject.date_distribution &&
          this.newObject.threshold > 0 && this.newObject.adm1) {

            if (new Date(this.newObject.date_distribution) < new Date(this.projectInfo.startDate) ||
            new Date(this.newObject.date_distribution) > new Date(this.projectInfo.endDate)) {
                this.snackBar.open(this.distribution.add_distribution_date_inside_project,
                  '', { duration: 5000, horizontalPosition: 'center' });
                return;
            } else {
                const res = [];
                let cashFound = false;
                let voucherFound = false;
                let isZero = false;
                let error = false;

                this.commodityArray.map(item => {
                    const existItem = res.find(x => x.modality === item.modality);

                    if (existItem || (cashFound && item.modality === 'Cash') || (voucherFound && item.modality === 'Voucher')) {
                        error = true;
                        return;
                    } else if (item.modality === 'Voucher') {
                        voucherFound = true;
                      } else if (item.modality === 'Cash') {
                        cashFound = true;
                                        } else if (item.value <= 0) {
                        isZero = true;
                    }

                    if (voucherFound && cashFound) {
                        error = true;
                        return;
                    }

                    res.push(item);
                });

                if (error) {
                    this.snackBar.open(this.distribution.add_distribution_multiple_commodities,
                      '', { duration: 5000, horizontalPosition: 'center' });
                    return;
                }
                if (isZero || this.criteriaNbBeneficiaries <= 0) {
                    this.snackBar.open(this.distribution.add_distribution_zero, '', { duration: 5000, horizontalPosition: 'center' });
                    return;
                }

                this.loadingCreation = true;
                const newDistribution: DistributionData = new DistributionData;
                newDistribution.type = this.newObject.type;
                newDistribution.threshold = this.newObject.threshold;
                newDistribution.project.id = this.queryParams.project;
                newDistribution.location.adm1 = this.newObject.adm1;
                newDistribution.location.adm2 = this.newObject.adm2;
                newDistribution.location.adm3 = this.newObject.adm3;
                newDistribution.location.adm4 = this.newObject.adm3;
                newDistribution.selection_criteria = this.criteriaArray;
                newDistribution.commodities = this.commodityArray;

                const formatDateOfBirth = this.newObject.date_distribution.split('/');
                if (formatDateOfBirth[0].length < 2) {
                    formatDateOfBirth[0] = '0' + formatDateOfBirth[0];
                }
                if (formatDateOfBirth[1].length < 2) {
                    formatDateOfBirth[1] = '0' + formatDateOfBirth[1];
                }

                newDistribution.date_distribution = formatDateOfBirth[2] + '-' + formatDateOfBirth[0] + '-' + formatDateOfBirth[1];
                let adm;
                if (this.newObject.adm4) {
                    adm = this.newObject.adm4;
                } else if (this.newObject.adm3) {
                    adm = this.newObject.adm3;
                } else if (this.newObject.adm2) {
                    adm = this.newObject.adm2;
                } else {
                    adm = this.newObject.adm1;
                }
                newDistribution.name = adm + '-' + newDistribution.date_distribution;

                // console.log('NEW ONE : ', newDistribution);

                const promise = this._distributionService.add(newDistribution);
                if (promise) {
                    promise.toPromise().then(response => {
                        this.snackBar.open(this.distribution.distribution + ' : ' + response.distribution.name +
                        this.distribution.add_distribution_created, '', { duration: 5000, horizontalPosition: 'center' });
                        this.router.navigate(['projects/distributions/' + response.distribution.id]);
                    });
                } else {
                    this.snackBar.open(this.distribution.add_distribution_error_creating,
                    '', { duration: 5000, horizontalPosition: 'center' });
                    this.loadingCreation = false;
                }
            }
        } else if (this.criteriaArray.length === 0) {
            this.snackBar.open(this.distribution.add_distribution_missing_selection_criteria,
            '', { duration: 5000, horizontalPosition: 'center' });
        } else if (!this.commodityArray[0]) {
            this.snackBar.open(this.distribution.add_distribution_missing_commodity, '', { duration: 5000, horizontalPosition: 'center' });
        } else if (!this.newObject.date_distribution) {
            this.snackBar.open(this.distribution.add_distribution_missing_date, '', { duration: 5000, horizontalPosition: 'center' });
        } else if (this.newObject.threshold <= 0) {
            this.snackBar.open(this.distribution.add_distribution_missing_threshold, '', { duration: 5000, horizontalPosition: 'center' });
        } else if (!this.newObject.adm1) {
            this.snackBar.open(this.distribution.add_distribution_missing_location, '', { duration: 5000, horizontalPosition: 'center' });
        } else {
            this.snackBar.open(this.distribution.add_distribution_check_fields, '', { duration: 5000, horizontalPosition: 'center' });
        }

    }

    setStep(index: string) {
        this.step = index;
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        let dialogRef;

        if (user_action === this.criteriaAction) {
            dialogRef = this.dialog.open(ModalAddLineComponent, {
                data: { data: [], entity: this.criteriaClass, mapper: this.mapper }
            });
        } else if (user_action === this.commodityAction) {
            dialogRef = this.dialog.open(ModalAddComponent, {
                data: { data: [], entity: this.commodityClass, mapper: this.mapper }
            });
        }
        if (dialogRef) {
            const create = dialogRef.componentInstance.onCreate.subscribe((data: Criteria) => {
                this.createElement(data, user_action);
            });

            dialogRef.afterClosed().subscribe(result => {
                create.unsubscribe();
            });
        }
    }

    /**
     * add row in selection criteria table and distributed commodity table
     * @param createElement
     * @param user_action
     */
    createElement(createElement: Object, user_action) {
        if (user_action === this.criteriaAction) {
            this.load = true;
            this.criteriaArray.push(createElement);

            this.criteriaService.getBeneficiariesNumber(
                this.newObject.type,
                this.criteriaArray,
                this.newObject.threshold,
                this.queryParams.project
            ).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                if (this.commodityArray.length > 0) {
                    this.commodityNb = [];
                    this.commodityArray.forEach(commodity => {
                        this.commodityNb.push(commodity.value * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;
            });
            this.criteriaData = new MatTableDataSource(this.criteriaArray);
        } else if (user_action === this.commodityAction) {
            this.commodityArray.push(createElement);

            this.commodityNb = [];
            this.commodityArray.forEach(commodity => {
                this.commodityNb.push(commodity.value * this.criteriaNbBeneficiaries);
            });

            this.commodityData = new MatTableDataSource(this.commodityArray);
        }
    }

    /**
     * delete row in selection criteria table and distributed commodity table
     * @param removeElement
     * @param user_action
     */
    removeElement(removeElement: Object, user_action) {
        if (user_action === this.criteriaAction) {
            const index = this.criteriaArray.findIndex((item) => item === removeElement);
            if (index > -1) {
                this.criteriaArray.splice(index, 1);
                this.criteriaData = new MatTableDataSource(this.criteriaArray);
            }
            this.load = true;

            this.criteriaService.getBeneficiariesNumber(
                this.newObject.type,
                this.criteriaArray,
                this.newObject.threshold,
                this.queryParams.project
            ).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                if (this.commodityArray.length > 0) {
                    this.commodityNb = [];
                    this.commodityArray.forEach(commodity => {
                        this.commodityNb.push(commodity.value * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;

            });
        } else if (user_action === this.commodityAction) {
            const index = this.commodityArray.findIndex((item) => item === removeElement);
            if (index > -1) {
                this.commodityArray.splice(index, 1);
                this.commodityNb.splice(index, 1);
                this.commodityData = new MatTableDataSource(this.commodityArray);
            }
        }
    }

    getProjectDates() {
        this._projectService.get().subscribe(
            result => {
                const projects = result;
                let keyForProject;

                Object.keys(projects).forEach(key => {
                    if (projects[key].id === this.queryParams.project) {
                        keyForProject = key;
                        return;
                    }
                });

                this.projectInfo.startDate = projects[keyForProject].start_date;
                this.projectInfo.endDate = projects[keyForProject].end_date;
            }
        );
    }
}
