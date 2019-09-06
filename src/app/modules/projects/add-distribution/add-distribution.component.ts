import { DatePipe } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalConfirmationComponent } from 'src/app/components/modals/modal-confirmation/modal-confirmation.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { ProjectService } from 'src/app/core/api/project.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { LanguageService } from 'src/app/core/language/language.service';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { ScreenSizeService } from 'src/app/core/screen-size/screen-size.service';
import { FormService } from 'src/app/core/utils/form.service';
import { ModalService } from 'src/app/core/utils/modal.service';
import { Commodity } from 'src/app/models/commodity';
import { DisplayType } from 'src/app/models/constants/screen-sizes';
import { Criteria } from 'src/app/models/criteria';
import { DateModelField } from 'src/app/models/custom-models/date-model-field';
import { Distribution } from 'src/app/models/distribution';
import { Location } from 'src/app/models/location';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/shared/adapters/date.adapter';
import { CriteriaService } from '../../../core/api/criteria.service';
import { DistributionService } from '../../../core/api/distribution.service';
import { LocationService } from '../../../core/api/location.service';

@Component({
    selector: 'app-add-distribution',
    templateUrl: './add-distribution.component.html',
    styleUrls: ['./add-distribution.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class AddDistributionComponent implements OnInit, DesactivationGuarded, OnDestroy {


    public objectInstance: Distribution;
    public objectFields: string[];
    public form: FormGroup;

    public criteriaClass = Criteria;
    public criteriaData = new MatTableDataSource<Criteria>();
    public commodityClass = Commodity;
    public commodityData = new MatTableDataSource<Commodity>();
    public criteriaNbBeneficiaries = 0;
    public commodityNb: number[] = [];

    public queryParams;
    public load = false;
    public loadingCreation: boolean;
    public projectInfo: any = { startDate: '', endDate: '' };
    initialAdmValues: any;


    @ViewChild('criteriaTable', { static: false }) criteriaTable: TableComponent;
    @ViewChild('commodityTable', { static: false }) commodityTable: TableComponent;

    // Screen size
    public currentDisplayType: DisplayType;
    private screenSizeSubscription: Subscription;

    // Language
    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private criteriaService: CriteriaService,
        private route: ActivatedRoute,
        private _distributionService: DistributionService,
        private _projectService: ProjectService,
        private snackbar: SnackbarService,
        private modalService: ModalService,
        private locationService: LocationService,
        public languageService: LanguageService,
        private screenSizeService: ScreenSizeService,
        public formService: FormService,
    ) { }

    ngOnInit() {
        this.screenSizeSubscription = this.screenSizeService.displayTypeSource.subscribe((displayType: DisplayType) => {
            this.currentDisplayType = displayType;
        });
        this.loadingCreation = false;
        this.objectFields = ['date', 'type', 'threshold'];
        this.getQueryParameter().subscribe(params => {
            this.queryParams = params;
            if (params.prefill === 'false' || !this._distributionService.distributionToDuplicate) {
                this.objectInstance = new Distribution();
                this.objectInstance.set('location', new Location());
                this.makeForm();
            } else {
                this.objectInstance = this._distributionService.distributionToDuplicate;
                this.criteriaData.data = this.objectInstance.get<Criteria[]>('selectionCriteria');
                this.commodityData.data = this.objectInstance.get<Commodity[]>('commodities');
                this.makeForm();
                this.updateNbBeneficiary();
            }
            this.initialAdmValues = {
                adm1: this.objectInstance.get('location').get('adm1') ? this.objectInstance.get('location').get('adm1').get('id') : null,
                adm2: this.objectInstance.get('location').get('adm2') ? this.objectInstance.get('location').get('adm2').get('id') : null,
                adm3: this.objectInstance.get('location').get('adm3') ? this.objectInstance.get('location').get('adm3').get('id') : null,
                adm4: this.objectInstance.get('location').get('adm4') ? this.objectInstance.get('location').get('adm4').get('id') : null
            };
        });
        this.getProjectDates();
    }

    ngOnDestroy() {
        this.screenSizeSubscription.unsubscribe();
    }

    makeForm() {
        this.form = this.formService.makeForm(this.objectInstance, this.objectFields, null);
    }


    /**
    * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
    */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.form.touched && this.objectInstance && !this.loadingCreation) {
            const dialogRef = this.dialog.open(ModalConfirmationComponent, {
                data: {
                    title: this.language.modal_leave,
                    sentence: this.language.modal_leave_sentence,
                    ok: this.language.modal_leave
                }
            });

            return dialogRef.afterClosed();
        } else {
            return (true);
        }
    }

    /**
     * get the parameter in the route
     * use to get the active project
     */
    getQueryParameter() {
        return this.route.queryParams;
    }

    getProjectDates() {
        this._projectService.get().subscribe(
            (projects) => {
                if (projects) {
                    projects.forEach((project: any) => {
                        if (project.id.toString() === this.queryParams.project) {
                            this.projectInfo.startDate = DateModelField.formatFromApi(project.start_date);
                            this.projectInfo.endDate = DateModelField.formatFromApi(project.end_date);
                            return;
                        }
                    });
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

    getMinDate() {
        return this.projectInfo.startDate > new Date() ? this.projectInfo.startDate : new Date();
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        const dialogRef = null;

        if (user_action === 'addCriteria') {
            this.modalService.openAddCriteriaDialog().subscribe((criteria: Criteria) => {
                if (!criteria) {
                    return;
                }
                this.createElement(criteria, 'addCriteria');
            });
        }
        else if (user_action === 'addCommodity') {
            this.modalService.openAddCommodityDialog().subscribe((commodity: Commodity) => {
                if (!commodity) {
                    return;
                }
                this.createElement(commodity, 'addCommodity');
                }
            );
        }
    }

    /**
     * add row in selection criteria table and distributed commodity table
     * @param createElement
     * @param user_action
     */
    createElement(createElement: any, user_action: string) {
        if (user_action === 'addCriteria') {
            this.load = true;
            this.criteriaData.data = [... this.criteriaData.data, createElement];
            this.updateNbBeneficiary();
        } else if (user_action === 'addCommodity') {
            this.commodityData.data = [...this.commodityData.data, createElement];
            this.commodityNb = [];
            this.commodityData.data.forEach(commodity => {
                this.commodityNb.push(commodity.get<number>('value') * this.criteriaNbBeneficiaries);
            });
        }
    }

    /**
     * delete row in selection criteria table and distributed commodity table
     * @param removeElement
     * @param user_action
     */
    removeElement(details, type: string) {

        if (details.action === 'delete') {
            if (type === 'criteria') {
                const index = this.criteriaData.data.findIndex(criterion => {
                    return criterion === details.element;
                });
                if (index > -1) {
                    this.criteriaData.data.splice(index, 1);

                    // Need to 'set' criteriaData.data to trigger the child component 'set' function
                    this.criteriaData.data = this.criteriaData.data;
                }

                // To remove the matSort if the array is empty
                if (this.criteriaData.data.length === 0) {
                    this.criteriaData.data = [];
                }

                this.updateNbBeneficiary();

            } else if (type === 'commodity') {
                const index = this.commodityData.data.findIndex((commodity) => {
                    return commodity === details.element;
                });
                if (index > -1) {
                    this.commodityData.data.splice(index, 1);

                    // Need to 'set' commodityData.data to trigger the child component 'set' function
                    this.commodityData.data = this.commodityData.data;

                    this.commodityNb.splice(index, 1);
                }

                // To remove the matSort if the array is empty
                if (this.commodityData.data.length === 0) {
                    this.commodityData.data = [];
                }
            }

        }
    }

    /**
     * create the new distribution object before send it to the back
     */
    add() {
        if (this.form.controls.type.value && this.criteriaData.data && this.criteriaData.data.length !== 0 &&
          this.commodityData.data && this.commodityData.data.length !== 0 && this.form.controls.date.value &&
          this.form.controls.threshold.value > 0 && this.form.controls.adm1.value && this.criteriaNbBeneficiaries > 0) {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
            if (this.form.controls.date.value < this.projectInfo.startDate || this.form.controls.date.value > this.projectInfo.endDate) {
                this.snackbar.error(this.language.add_distribution_date_inside_project);
                return;
            } else if (this.form.controls.date.value < now || this.form.controls.date.value === now) {
                this.snackbar.error(this.language.add_distribution_date_before_today);
                return;
            }
            else {
                for (const commodity of this.commodityData.data) {
                    if (commodity.get<number>('value') <= 0) {
                        this.snackbar.error(this.language.add_distribution_zero);
                        return;
                    }
                }
                if (this.commodityData.data.length > 1) {
                    const commodityAlone = this.commodityData.data.filter((commodity: Commodity) => {
                        return commodity.get('modalityType').get<string>('name') === 'Mobile Money' ||
                            commodity.get('modalityType').get<string>('name') === 'QR Code Voucher';
                    });
                    if (commodityAlone.length > 0) {
                        this.snackbar.error(this.language.add_distribution_multiple_modalities);
                        return;
                    }
                }

                this.loadingCreation = true;
                const newDistribution = new Distribution();

                const location = new Location();

                ['adm1', 'adm2', 'adm3', 'adm4'].forEach(adm => {
                    if (this.form.controls[adm].value) {
                        location.set(adm,
                            this.objectInstance.get('location').getOptions(adm).filter(option => {
                                return option.get('id') === this.form.controls[adm].value;
                            })[0]);
                    }
                });

                let admName;
                if (this.form.controls.adm4.value) {
                    admName = location.get('adm4').get('name');
                } else if (this.form.controls.adm3.value) {
                    admName = location.get('adm3').get('name');
                } else if (this.form.controls.adm2.value) {
                    admName = location.get('adm2').get('name');
                } else {
                    admName = location.get('adm1').get('name');
                }

                newDistribution.set('location', location);

                const datePipe = new DatePipe('en-US');
                newDistribution.set('name', admName + '-' + datePipe.transform(this.form.controls.date.value, 'dd-MM-yyyy'));

                newDistribution.set('type', this.objectInstance.getOptions('type').filter(option => {
                    return option.get('id') === this.form.controls.type.value;
                })[0]);
                newDistribution.set('threshold', this.form.controls.threshold.value);
                newDistribution.set('projectId', this.queryParams.project);
                newDistribution.set('selectionCriteria', this.criteriaData.data);
                newDistribution.set('commodities', this.commodityData.data);
                newDistribution.set('date', this.form.controls.date.value);

                this._distributionService.create(newDistribution.modelToApi()).subscribe((response) => {
                    if (response) {
                        this.snackbar.success(
                            this.language.distribution + ' : ' + response.distribution.name + this.language.add_distribution_created);
                        this.router.navigate(['projects/distributions/' + response.distribution.id]);
                    }

                }, err => {
                    this.snackbar.error(this.language.add_distribution_error_creating);
                    this.loadingCreation = false;
                });
            }
        } else if (this.criteriaData.data.length === 0) {
            this.snackbar.error(this.language.add_distribution_missing_selection_criteria);

        } else if (!this.commodityData.data[0]) {
            this.snackbar.error(this.language.add_distribution_missing_commodity);
        } else if (!this.form.controls.date.value) {
            this.snackbar.error(this.language.add_distribution_missing_date);
        } else if (this.form.controls.threshold.value <= 0) {
            this.snackbar.error(this.language.add_distribution_missing_threshold);
        } else if (!this.form.controls.adm1.value) {
            this.snackbar.error(this.language.add_distribution_missing_location);
        } else if (this.criteriaNbBeneficiaries <= 0) {
            this.snackbar.error(this.language.add_distribution_no_beneficiaries);
        } else {
            this.snackbar.error(this.language.add_distribution_check_fields);
        }

    }

    /**
     * to cancel the creation of distribution and go back in the distribution page
     */
    cancel() {
        this.router.navigate(['projects']);
    }

    updateNbBeneficiary() {
        if (this.criteriaData.data.length !== 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(
                this.form.controls.type.value,
                this.criteriaData.data,
                this.form.controls.threshold.value,
                this.queryParams.project
            ).subscribe(response => {
                if (response) {
                    this.criteriaNbBeneficiaries = response.number;
                }
                if (this.commodityData.data.length > 0) {
                    this.commodityNb = [];
                    this.commodityData.data.forEach(commodity => {
                        this.commodityNb.push(commodity.get<number>('value') * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;

            }, error => this.load = false);
        }
    }
}
