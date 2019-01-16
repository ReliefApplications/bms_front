import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';
import { Criteria } from '../../../model/criteria';
import { Commodity } from '../../../model/commodity';
import { count } from '@swimlane/ngx-charts';
import { Project } from '../../../model/project';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import {CustomDateAdapter, APP_DATE_FORMATS} from 'src/app/core/utils/date.adapter';

@Component({
    selector: 'app-modal-add',
    templateUrl: './modal-add.component.html',
    styleUrls: ['../modal.component.scss', './modal-add.component.scss'],
    providers: [
      { provide: DateAdapter, useClass: CustomDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalAddComponent extends ModalComponent {
    public entityDisplayedName = '';
    public oldEntity = '';
    mapperObject = null;
    modal=GlobalText.TEXTS;

    display = false;
    oldSelectedModality = 0;
    displayAdd: boolean = false;
    maxLength:number=35;

    @Input() data: any;
    @Output() onCreate = new EventEmitter();

    ngOnInit() {
        this.checkData();
        this.loadData();
        this.prefill();

        if ((this.properties[0] == 'modality' && this.properties[2] == 'unit'))
            this.displayAdd = true;
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
                    }
                    else if (element === 'end_date') {
                        let date = new Date();
                        date.setMonth(date.getMonth() + 3);
                        this.newObject[element] = date;
                    }
                }
            )
        } else if (this.data.entity === Commodity) {
            this.properties.forEach(
                (element) => {
                    setTimeout(() => {
                        if (element == 'modality')
                           this.newObject[element] = 1;
                           this.selected('', this.newObject);
                    }, 0);

                    if (element === 'unit') {
                        this.newObject[element] = 'USD';
                    }
                }
            )
        }
    }

    selected(event, newObject) {
        if (newObject.modality) {
            if (newObject.modality !== this.oldSelectedModality) {
                this.getModalityType(newObject.modality);
                this.oldSelectedModality = newObject.modality;
            }
        }
        else if (event.value == "ROLE_PROJECT_MANAGER" || event.value == "ROLE_PROJECT_OFFICER" || event.value == "ROLE_FIELD_OFFICER") {
            this.newObject['country'] = [];
            this.newObject['projects'] = [];

            this.form.controls['projectsControl'].enable();
            this.form.controls['countryControl'].disable();
        }
        else if(event.value == "ROLE_COUNTRY_MANAGER" || event.value == "ROLE_REGIONAL_MANAGER") {
            this.newObject['country'] = [];
            this.newObject['projects'] = [];

            this.form.controls['countryControl'].enable();
            this.form.controls['projectsControl'].disable();
        }
        else {
            this.newObject['country'] = [];
            this.newObject['projects'] = [];

            this.form.controls['projectsControl'].disable();
            this.form.controls['countryControl'].disable();
        }

        if(event.value == "ROLE_ADMIN") {
            this.user.getAllCountries().forEach(
                element => {
                    this.newObject['country'].push(element.id);
                }
            )
        }

    }

    getModalityType(modality) {
        this.modalitiesService.getModalitiesType(modality).subscribe(response => {
            this.loadedData.type = response;
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

        //Check fields for Users settings
        if (this.newObject.username || this.newObject.username == '') {
            const checkMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
            if (!checkMail.test(this.newObject.username) || this.newObject.username == '') {
                this.snackBar.open(this.modal.modal_add_invalid_mail, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            if (this.newObject.password == '') {
                this.snackBar.open(this.modal.modal_no_password, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            const checkPass = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/);
            if (!checkPass.test(this.newObject.password)) {
                this.snackBar.open(this.modal.modal_not_enough_strong, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            if (this.newObject.rights == "") {
                this.snackBar.open(this.modal.modal_add_no_right, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
            if (this.newObject.rights == "ROLE_PROJECT_MANAGER" || this.newObject.rights == "ROLE_PROJECT_OFFICER" || this.newObject.rights == "ROLE_FIELD_OFFICER") {
                if (this.newObject.projects == undefined || Object.keys(this.newObject.projects).length == 0) {
                    this.snackBar.open(this.modal.modal_no_project, '', { duration: 5000, horizontalPosition: 'right' });
                    return;
                }
            }
            else if (this.newObject.rights == "ROLE_REGIONAL_MANAGER" || this.newObject.rights == "ROLE_COUNTRY_MANAGER" || this.newObject.rights == "ROLE_READ_ONLY") {
                if (this.newObject.country == undefined) {
                    this.snackBar.open(this.modal.modal_no_country, '', { duration: 5000, horizontalPosition: 'right' });
                    return;
                }
            }
        }

        //Check fields for Country Specific options settings
        else if ((this.newObject.countryIso3 && this.newObject.field && this.newObject.type) || this.newObject.countryIso3 == '' || this.newObject.field == '') {
            if (this.newObject.field == '' || this.newObject.type == '') {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
        }

        //Check fields for Donors settings
        else if ((this.newObject.fullname && this.newObject.shortname) || this.newObject.fullname == '' || this.newObject.shortname == '') {
            if (this.newObject.fullname == '' || this.newObject.shortname == '') {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
        }
        //Check fields for Projects settings
        else if ((this.newObject.donors && this.newObject.donors_name && this.newObject.name && this.newObject.sectors && this.newObject.sectors_name) || this.newObject.name == '' || (this.newObject.sectors_name && Object.keys(this.newObject.sectors_name).length == 0) || (this.newObject.sectors && Object.keys(this.newObject.sectors).length == 0)) {

            if (!this.newObject.end_date || !this.newObject.name || !this.newObject.start_date || !this.newObject.value || this.newObject.value < 0) {
                this.snackBar.open(this.modal.modal_add_check_fields_budget, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            if (new Date(this.newObject.start_date).getDate()+ new Date(this.newObject.start_date).getMonth() + new Date(this.newObject.start_date).getMonth() + new Date(this.newObject.start_date).getFullYear() > new Date(this.newObject.end_date).getDate()+ new Date(this.newObject.end_date).getMonth() + new Date(this.newObject.end_date).getMonth() + new Date(this.newObject.start_date).getFullYear()) {
                this.snackBar.open(this.modal.modal_check_date, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }


            if (typeof this.newObject.start_date == "object") {
                let day = this.newObject.start_date.getDate();
                let month = this.newObject.start_date.getMonth() + 1;
                const year = this.newObject.start_date.getFullYear();

                if (day < 10)
                    day = "0" + day;
                if (month < 10)
                    month = "0" + month;
                this.newObject.start_date = year + "-" + month + "-" + day;
            }

            if (typeof this.newObject.end_date == "object") {
                let day = this.newObject.end_date.getDate();
                let month = this.newObject.end_date.getMonth() + 1;
                const year = this.newObject.end_date.getFullYear();

                if (day < 10)
                    day = "0" + day;
                if (month < 10)
                    month = "0" + month;
                this.newObject.end_date = year + "-" + month + "-" + day;
            }
        }

        //Check commodity in addDistribution
        else if ((this.newObject.modality) || this.newObject.modality == '') {
            if (this.newObject.unit && this.newObject.value && this.newObject.modality == 1)
                this.newObject.type = 1;

            if (this.newObject.modality == '' || this.newObject.type == '' || this.newObject.unit == '' || !this.newObject.value || this.newObject.value < 0) {
                this.snackBar.open(this.modal.modal_add_check_fields_quantity, '', { duration: 5000, horizontalPosition: 'right' });
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
}
