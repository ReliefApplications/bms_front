import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DateAdapter, MatDialog, MatTableDataSource, MAT_DATE_FORMATS } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ModalLeaveComponent } from 'src/app/components/modals/modal-leave/modal-leave.component';
import { ProjectService } from 'src/app/core/api/project.service';
import { DesactivationGuarded } from 'src/app/core/guards/deactivate.guard';
import { SnackbarService } from 'src/app/core/logging/snackbar.service';
import { AsyncacheService } from 'src/app/core/storage/asyncache.service';
import { APP_DATE_FORMATS, CustomDateAdapter } from 'src/app/core/utils/date.adapter';
import { Project } from 'src/app/model/project.new';
import { GlobalText } from '../../../../texts/global';
import { ModalAddComponent } from '../../../components/modals/modal-add/modal-add.component';
import { CriteriaService } from '../../../core/api/criteria.service';
import { CommodityService } from '../../../core/api/commodity.service';
import { DistributionService } from '../../../core/api/distribution.service';
import { LocationService } from '../../../core/api/location.service';
import { Mapper } from '../../../core/utils/mapper.service';
import { Commodity } from '../../../model/commodity.new';
import { Location } from '../../../model/location.new';
import { Criteria } from '../../../model/criteria.new';
import { DistributionData } from '../../../model/distribution-data';
import { Distribution } from 'src/app/model/distribution.new';
import { CustomModelField } from 'src/app/model/CustomModel/custom-model-field';
import { ModalService } from 'src/app/core/utils/modal.service';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';
import { TableComponent } from 'src/app/components/table/table.component';
import { DatePipe } from '@angular/common';





@Component({
    selector: 'app-add-distribution',
    templateUrl: './add-distribution.component.html',
    styleUrls: ['./add-distribution.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class AddDistributionComponent implements OnInit, DesactivationGuarded {

    public texts =  GlobalText.TEXTS;
    public language = GlobalText.language;

    public objectInstance: Distribution;
    public objectFields: string[];
    public form: FormGroup;

    public criteriaClass = Criteria;
    public criteriaArray = new Array<Criteria>();
    public commodityClass = Commodity;
    public commodityArray = new Array<Commodity>();
    public criteriaNbBeneficiaries = 0;
    public commodityNb: number[] = [];

    public maxHeight = GlobalText.maxHeight;
    public maxWidthMobile = GlobalText.maxWidthMobile;
    public maxWidthFirstRow = GlobalText.maxWidthFirstRow;
    public maxWidthSecondRow = GlobalText.maxWidthSecondRow;
    public maxWidth = GlobalText.maxWidth;
    public heightScreen;
    public widthScreen;

    public queryParams;
    public load = false;
    public loadingCreation: boolean;
    public projectInfo: any = { startDate: '', endDate: '' };


    @ViewChild('criteriaTable') criteriaTable: TableComponent;
    @ViewChild('commodityTable') commodityTable: TableComponent;

    constructor(
        public mapper: Mapper,
        public dialog: MatDialog,
        private router: Router,
        private criteriaService: CriteriaService,
        private route: ActivatedRoute,
        private _distributionService: DistributionService,
        private _projectService: ProjectService,
        private snackbar: SnackbarService,
        private modalService: ModalService,
    ) { }

    ngOnInit() {
        this.loadingCreation = false;
        this.objectInstance = new Distribution();
        this.objectInstance.fields.location.value = new Location();
        this.objectFields = ['adm1', 'adm2', 'adm3', 'adm4', 'date', 'type', 'threshold'];
        this.makeForm();
        this.checkSize();
        this.getQueryParameter();
        this.loadProvince();
        this.getProjectDates();
    }


    makeForm() {
        const formControls = {};
        this.objectFields.forEach((fieldName: string) => {
            formControls[fieldName] = new FormControl(
                this.objectInstance.fields[fieldName] ? this.objectInstance.fields[fieldName].value : null,
            );
        });
        this.form = new FormGroup(formControls);
    }


    /**
    * Verify if modifications have been made to prevent the user from leaving and display dialog to confirm we wiwhes to delete them
    */
    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        if (this.objectInstance && !this.loadingCreation) {
            const dialogRef = this.dialog.open(ModalLeaveComponent, {});

            return dialogRef.afterClosed();
        } else {
            return (true);
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

    getProjectDates() {
        this._projectService.get().subscribe(
            (projects) => {
                projects.forEach(project => {
                    if (project.id === this.queryParams.project) {
                        this.projectInfo.startDate = project.fields.startDate.value;
                        this.projectInfo.endDate = project.fields.endDate.value;
                        return;
                    }
                });
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
     * Get adm1 from the back or from the cache service with the key ADM1
     */
    loadProvince() {
        this._distributionService.fillAdm1Options(this.objectInstance);
        this.form.controls.adm2.setValue(null);
        this.form.controls.adm3.setValue(null);
        this.form.controls.adm4.setValue(null);
    }

    /**
     *  Get adm2 from the back or from the cache service with the id of adm1
     *  @param adm1Id
     */
    loadDistrict(adm1Id) {
        if (adm1Id) {
            this._distributionService.fillAdm2Options(this.objectInstance, adm1Id);
        }
        this.form.controls.adm2.setValue(null);
        this.form.controls.adm3.setValue(null);
        this.form.controls.adm4.setValue(null);
    }

    /**
     * Get adm3 from the back or from the cahce service with the if of adm2
     * @param adm2Id
     */
    loadCommunity(adm2Id) {
        if (adm2Id) {
            this._distributionService.fillAdm3Options(this.objectInstance, adm2Id);
        }
        this.form.controls.adm3.setValue(null);
        this.form.controls.adm4.setValue(null);
    }

    /**
     *  Get adm4 from the back or from the cahce service with the id of adm3
     * @param adm3Id
     */
    loadVillage(adm3Id) {
        if (adm3Id) {
            this._distributionService.fillAdm4Options(this.objectInstance, adm3Id);
        }
        this.form.controls.adm4.setValue(null);
    }

    /**
    * open each modal dialog
    */
    openDialog(user_action): void {
        const dialogRef = null;

        if (user_action === 'addCriteria') {
            this.modalService.openAddCriteriaDialog().then((criteria: Criteria) => {
                this.createElement(criteria, 'addCriteria');
            });
        } else if (user_action === 'addCommodity') {
            this.modalService.openAddCommodityDialog().then((commodity: Commodity) => {
                this.createElement(commodity, 'addCommodity');
            });
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
            this.criteriaArray.push(createElement);
            this.updateNbBeneficiary();
            this.criteriaTable.updateTable(this.criteriaArray);
        } else if (user_action === 'addCommodity') {
            this.commodityArray.push(createElement);
            this.commodityNb = [];
            this.commodityArray.forEach(commodity => {
                this.commodityNb.push(commodity.fields.value.value * this.criteriaNbBeneficiaries);
            });
            this.commodityTable.updateTable(this.commodityArray);
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
                const index = this.criteriaArray.findIndex(criterion => {
                    return criterion === details.element;
                });
                if (index > -1) {
                    this.criteriaArray.splice(index, 1);
                }

                // To remove the matSort if the array is empty
                if (this.criteriaArray.length === 0) {
                    this.criteriaArray = [];
                }

                this.updateNbBeneficiary();

                this.criteriaTable.updateTable(this.criteriaArray);
            } else if (type === 'commodity') {
                const index = this.commodityArray.findIndex((commodity) => {
                    return commodity === details.element;
                });
                if (index > -1) {
                    this.commodityArray.splice(index, 1);
                    this.commodityNb.splice(index, 1);
                }

                // To remove the matSort if the array is empty
                if (this.commodityArray.length === 0) {
                    this.commodityArray = [];
                }
                this.commodityTable.updateTable(this.commodityArray);
            }

        }
    }

    /**
     * create the new distribution object before send it to the back
     */
    add() {
        if (this.form.controls.type.value && this.criteriaArray && this.criteriaArray.length !== 0 &&
          this.commodityArray && this.commodityArray.length !== 0 && this.form.controls.date.value &&
          this.form.controls.threshold.value > 0 && this.form.controls.adm1) {

            if (new Date(this.form.controls.date.value) < new Date(this.projectInfo.startDate) ||
            new Date(this.form.controls.date.value) > new Date(this.projectInfo.endDate)) {
                this.snackbar.error(this.texts.add_distribution_date_inside_project);
                return;
            } else {
                const distributionModality = this.commodityArray[0].fields.modality.value;
                for (const commodity of this.commodityArray) {
                    if (commodity.fields.value.value <= 0) {
                        this.snackbar.error(this.texts.add_distribution_zero);
                        return;
                    } else if (commodity.fields.modality.value !== distributionModality) {
                        this.snackbar.error(this.texts.add_distribution_multiple_modalities);
                        return;
                    }
                }

                this.loadingCreation = true;
                const newDistribution = new Distribution();
                newDistribution.fields.location.value = new Location();


                const adms = ['adm1', 'adm2', 'adm3', 'adm4'];

                adms.forEach(field => {
                    if (this.form.controls[field].value) {
                        newDistribution.fields.location.value.fields[field].value =
                            this.objectInstance.fields.location.value.fields[field].options.filter(option => {
                                return option.fields.id.value === this.form.controls[field].value;
                            })[0];
                    }
                });

                newDistribution.fields.type.value = this.form.controls.type.value;
                newDistribution.fields.threshold.value = this.form.controls.threshold.value;
                newDistribution.fields.projectId.value = this.queryParams.project;
                newDistribution.fields.selectionCriteria.value = this.criteriaArray;
                newDistribution.fields.commodities.value = this.commodityArray;
                newDistribution.fields.date.value = this.form.controls.date.value;

                let adm;
                if (this.form.controls.adm4.value) {
                    adm = newDistribution.fields.location.value.fields.adm4.value.fields.name.value;
                } else if (this.form.controls.adm3.value) {
                    adm = newDistribution.fields.location.value.fields.adm3.value.fields.name.value;
                } else if (this.form.controls.adm2.value) {
                    adm = newDistribution.fields.location.value.fields.adm2.value.fields.name.value;
                } else {
                    adm = newDistribution.fields.location.value.fields.adm1.value.fields.name.value;
                }

                const datePipe = new DatePipe('en-US');
                newDistribution.fields.name.value = adm + '-' + datePipe.transform(this.form.controls.date.value, 'yyyy-MM-dd');

                this._distributionService.create(newDistribution.modelToApi()).subscribe((response) => {
                    this.snackbar.success(
                        this.texts.distribution + ' : ' + response.distribution.name + this.texts.add_distribution_created);
                    this.router.navigate(['projects/distributions/' + response.distribution.id]);

                }, err => {
                    this.snackbar.error(this.texts.add_distribution_error_creating);
                    this.loadingCreation = false;
                });
            }
        } else if (this.criteriaArray.length === 0) {
            this.snackbar.error(this.texts.add_distribution_missing_selection_criteria);

        } else if (!this.commodityArray[0]) {
            this.snackbar.error(this.texts.add_distribution_missing_commodity);
        } else if (!this.form.controls.date.value) {
            this.snackbar.error(this.texts.add_distribution_missing_date);
        } else if (this.form.controls.threshold.value <= 0) {
            this.snackbar.error(this.texts.add_distribution_missing_threshold);
        } else if (!this.form.controls.adm1) {
            this.snackbar.error(this.texts.add_distribution_missing_location);
        } else {
            this.snackbar.error(this.texts.add_distribution_check_fields);
        }

    }

    /**
     * to cancel the creation of distribution and go back in the distribution page
     */
    cancel() {
        this.router.navigate(['projects']);
    }

    updateNbBeneficiary() {
        if (this.criteriaArray.length !== 0) {
            this.load = true;
            this.criteriaService.getBeneficiariesNumber(
                this.form.controls.type.value,
                this.criteriaArray,
                this.form.controls.threshold.value,
                this.queryParams.project
            ).subscribe(response => {
                this.criteriaNbBeneficiaries = response.number;
                if (this.commodityArray.length > 0) {
                    this.commodityNb = [];
                    this.commodityArray.forEach(commodity => {
                        this.commodityNb.push(commodity.fields.value.value * this.criteriaNbBeneficiaries);
                    });
                }
                this.load = false;

            }, error => this.load = false);
        }
    }
}
