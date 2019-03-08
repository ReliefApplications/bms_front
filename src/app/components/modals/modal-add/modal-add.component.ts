import { Component, OnInit, DoCheck, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';
import { Criteria } from '../../../model/criteria';
import { Commodity } from '../../../model/commodity';
import { count } from '@swimlane/ngx-charts';
import { Project } from '../../../model/project';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { CustomDateAdapter, APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';
import { format } from 'url';

@Component({
    selector: 'app-modal-add',
    templateUrl: './modal-add.component.html',
    styleUrls: ['../modal.component.scss', './modal-add.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalAddComponent extends ModalComponent implements OnInit, DoCheck {
    public entityDisplayedName = '';
    public oldEntity = '';
    mapperObject = null;
    public updatedObject: any;


    display = false;
    oldSelectedModality = 0;
    displayAdd = false;
    maxLength = 80;

    @Input() data: any;
    @Output() onCreate = new EventEmitter();

    ngOnInit() {
        this.checkData();
        this.loadData();
        this.prefill();

        if ((this.properties[0] === 'modality' && this.properties[2] === 'unit')) {
            this.displayAdd = true;
        }
    }

    checkData() {
        this.newObject = Object.create(this.data.entity.prototype);
        this.newObject.constructor.apply(this.newObject);
        this.mapperObject = this.data.mapper.findMapperObject(this.data.entity);
        this.entityDisplayedName = this.data.entity.getDisplayedName();
        this.properties = Object.getOwnPropertyNames(this.newObject.getMapperAdd(this.newObject));
        this.propertiesTypes = this.newObject.getModalTypeProperties(this.newObject);
        this.oldEntity = this.data.entity;
    }

    /**
     * check if the langage has changed
     * or if a select field has changed
     */
    ngDoCheck() {
        if (this.modal !== GlobalText.TEXTS) {
            this.modal = GlobalText.TEXTS;
            this.entityDisplayedName = this.data.entity.getDisplayedName();
        } else if (this.oldEntity !== this.data.entity) {
            this.checkData();
        }
    }

    prefill() {
        if (this.data.entity === Project) {

            this.properties.forEach(
                (element) => {
                    if (element === 'start_date') {
                        this.newObject[element] = new Date();
                    } else if (element === 'end_date') {
                        const date = new Date();
                        date.setMonth(date.getMonth() + 3);
                        this.newObject[element] = date;
                    }
                }
            );
        } else if (this.data.entity === Commodity) {
            this.properties.forEach(
                (element) => {
                    setTimeout(() => {
                        if (element === 'modality') {
                            this.newObject[element] = 1;
                        }
                        this.selected(this.newObject);
                    }, 0);

                    if (element === 'unit') {
                        this.newObject[element] = 'USD';
                    }
                }
            );
        }
    }

    selected(newObject) {
        if (newObject) {
            if (typeof newObject === 'number' || newObject.modality) {
                if (this.newObject.modality !== this.oldSelectedModality) {
                    this.getModalityType(this.newObject.modality);
                    this.oldSelectedModality = this.newObject.modality;
                }
            } else if (newObject === 'ROLE_PROJECT_MANAGER' || newObject === 'ROLE_PROJECT_OFFICER' || newObject === 'ROLE_FIELD_OFFICER') {
                this.newObject['country'] = [];
                this.newObject['projects'] = [];

                this.form.controls['projectsControl'].enable();
                this.form.controls['countryControl'].disable();
            } else if (newObject === 'ROLE_COUNTRY_MANAGER' || newObject === 'ROLE_REGIONAL_MANAGER') {
                this.newObject['country'] = [];
                this.newObject['projects'] = [];

                this.form.controls['countryControl'].enable();
                this.form.controls['projectsControl'].disable();
            } else {
                this.newObject['country'] = [];
                this.newObject['projects'] = [];

                this.form.controls['projectsControl'].disable();
                this.form.controls['countryControl'].disable();
            }
        }
    }

    getModalityType(modality) {
        this.modalitiesService.getModalitiesType(modality).subscribe(response => {
            this.loadedData.type = response;
            this.newObject.type = response[0].id;

            for (let i = 0; i < this.loadedData.type.length; i++) {
                if (this.loadedData.type[i].name === 'Mobile') {
                    this.loadedData.type[i].name = 'Mobile Money';
                }
            }
        });
    }

    description(): String {
        if (this.data.entity.getAddDescription) {
            return this.data.entity.getAddDescription();
        } else {
            return undefined;
        }
    }

    // emit the new object
    add(): any {
        // Check fields for Users settings
        if ((this.newObject.username || this.newObject.username === '') && this.data.entity.__classname__ !== 'Vendors') {
            const checkMail = new RegExp(/^[\w\.\+-]+@[\w-]+\.[\w-\.]+[a-z]+$/);
            if (!checkMail.test(this.newObject.username) || this.newObject.username === '') {
                this.snackbar.error(this.modal.modal_add_invalid_mail);
                return;
            }

            if (this.newObject.password === '') {
                this.snackbar.error(this.modal.modal_no_password);
                return;
            }

            const checkPass = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);
            if (!checkPass.test(this.newObject.password)) {
                this.snackbar.error(this.modal.modal_not_enough_strong);
                return;
            }

            if (this.newObject.rights === '') {
                this.snackbar.error(this.modal.modal_add_no_right);
                return;
            }
            if (this.newObject.rights === 'ROLE_PROJECT_MANAGER' ||
            this.newObject.rights === 'ROLE_PROJECT_OFFICER' ||
            this.newObject.rights === 'ROLE_FIELD_OFFICER') {
                if (this.newObject.projects === undefined || Object.keys(this.newObject.projects).length === 0) {
                    this.snackbar.error(this.modal.modal_no_project);
                    return;
                }
            } else if (this.newObject.rights === 'ROLE_REGIONAL_MANAGER' ||
            this.newObject.rights === 'ROLE_COUNTRY_MANAGER' ||
            this.newObject.rights === 'ROLE_READ_ONLY') {
                if (this.newObject.country === undefined) {
                    this.snackbar.error(this.modal.modal_no_country);
                    return;
                }
            }
        } else if ((this.newObject.countryIso3 && this.newObject.field && this.newObject.type) ||
        this.newObject.countryIso3 === '' || this.newObject.field === '') {
            if (this.newObject.field === '' || this.newObject.type === '') {
                this.snackbar.error(this.modal.modal_check_fields);
                return;
            }
        } else if ((this.newObject.fullname && this.newObject.shortname) || this.newObject.fullname === '' ||
        this.newObject.shortname === '') {
            if (this.newObject.fullname === '' || this.newObject.shortname === '') {
                this.snackbar.error(this.modal.modal_check_fields);
                return;
            }
        } else if ((this.newObject.donors && this.newObject.donors_name && this.newObject.name &&
          this.newObject.sectors && this.newObject.sectors_name) || this.newObject.name === '' ||
          (this.newObject.sectors_name && Object.keys(this.newObject.sectors_name).length === 0) ||
          (this.newObject.sectors && Object.keys(this.newObject.sectors).length === 0)) {
            if (!this.newObject.end_date || !this.newObject.name || !this.newObject.start_date ||
              !this.newObject.value || this.newObject.value < 0) {
                this.snackbar.error(this.modal.modal_add_check_fields_budget);
                return;
            }

            if (new Date(this.newObject.start_date) > new Date(this.newObject.end_date)) {
                this.snackbar.error(this.modal.modal_check_date);
                return;
            }


            if (typeof this.newObject.start_date === 'object') {
                let day = this.newObject.start_date.getDate();
                let month = this.newObject.start_date.getMonth() + 1;
                const year = this.newObject.start_date.getFullYear();

                if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                this.newObject.start_date = year + '-' + month + '-' + day;
            }

            if (typeof this.newObject.end_date === 'object') {
                let day = this.newObject.end_date.getDate();
                let month = this.newObject.end_date.getMonth() + 1;
                const year = this.newObject.end_date.getFullYear();

                if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                this.newObject.end_date = year + '-' + month + '-' + day;
            }
        }

        // Check fields for Vendors in settings
        else if (this.newObject && (this.newObject.shop || this.newObject.shop === '')) {
            this.newObject.user = {
                username: this.newObject.username,
                password: this.newObject.password
            };
            if (this.newObject.name === '' ||
                this.newObject.shop === '' ||
                this.newObject.address === '' ||
                this.newObject.username === '' ||
                this.newObject.password === ''
            ) {
                this.snackbar.error(this.modal.modal_check_fields);
                return;
            }
        }

        // Check commodity in addDistribution
        else if ((this.newObject.modality) || this.newObject.modality === '') {
            if (this.newObject.unit && this.newObject.value && this.newObject.modality === 1) {
                this.newObject.type = 1;
            }

            if (this.newObject.modality === '' || this.newObject.type === '' ||
            this.newObject.unit === '' || !this.newObject.value || this.newObject.value < 0) {
                this.snackbar.error(this.modal.modal_add_check_fields_quantity);
                return;
            }
        }

        const formatedObject = this.data.entity.formatFromModalAdd(this.newObject, this.loadedData);
        this.onCreate.emit(formatedObject);
        this.closeDialog();
    }

    unitType(): string {
        if (this.newObject && this.newObject.modality === 2) {
            // Modality = 2 => Cash => Unit = Currency
            return 'Currency';
        } else {
            return 'Unit';
        }
    }

    handleCheckbox() {
        if (this.data.entity.__classname__ === 'Booklet') {
            this.newObject.individual_to_all = !this.newObject.individual_to_all;
            if (!this.newObject.individual_values) {
                const individual_values = new Array(this.newObject.number_vouchers);
                const individual_value = this.newObject.individual_value ? this.newObject.individual_value : 1;
                individual_values.fill(individual_value);
                this.newObject.individual_values = individual_values;
                this.newObject.individual_value = null;
            } else {
                this.newObject.individual_value = this.newObject.individual_values ? this.newObject.individual_values[0] : 1;
                this.newObject.individual_values = null;
            }
        }
    }

    handleChangeNumberVouchers() {
        if (this.newObject.individual_to_all) {
            if (this.newObject.individual_values.length > this.newObject.number_vouchers) {
                while (this.newObject.individual_values.length > this.newObject.number_vouchers) {
                    this.newObject.individual_values.pop();
                }
            } else if (this.newObject.individual_values.length < this.newObject.number_vouchers) {
                while (this.newObject.individual_values.length < this.newObject.number_vouchers) {
                    const value = this.newObject.individual_values[0] ? this.newObject.individual_values[0] : 1;
                    this.newObject.individual_values.push(value);
                }
            }
        }
    }

    trackByFn(i: number) {
        return i;
      }
}
