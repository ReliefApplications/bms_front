import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';
import { Criteria } from '../../../model/criteria';
import { Commodity } from '../../../model/commodity';
import { count } from '@swimlane/ngx-charts';

@Component({
    selector: 'app-modal-add',
    templateUrl: './modal-add.component.html',
    styleUrls: ['../modal.component.scss', './modal-add.component.scss']
})
export class ModalAddComponent extends ModalComponent {
    public entityDisplayedName = '';
    public oldEntity = '';
    mapperObject = null;

    display = false;
    oldSelectedModality = 0;
    @Input() data: any;
    @Output() onCreate = new EventEmitter();

    ngOnInit() {
        this.checkData();
        this.loadData();
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

    selected(event) {
        if (event.modality) {
            if (event.modality !== this.oldSelectedModality) {
                this.getModalityType(event.modality);
                this.oldSelectedModality = event.modality;
            }
        }
        else if (event.value == "ROLE_PROJECT_MANAGER" || event.value == "ROLE_PROJECT_OFFICER" || event.value == "ROLE_FIELD_OFFICER") {
            this.form.controls['projectsControl'].enable();
            this.form.controls['countryControl'].disable();
        }
        // else if (event.value == "ROLE_REGIONAL_MANAGER" || event.value == "ROLE_COUNTRY_MANAGER" || event.value == "ROLE_READ_ONLY") {
        //     this.form.controls['projectsControl'].disable();
        //     this.form.controls['countryControl'].enable();
        // }
        else {
            this.form.controls['projectsControl'].disable();
            this.form.controls['countryControl'].disable();
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
        if (this.newObject.username) {
            if (this.newObject.rights == "") {
                this.snackBar.open('You must defined a right', '', { duration: 3000, horizontalPosition: 'right' });
                return;
            }
            if (this.newObject.rights == "ROLE_PROJECT_MANAGER" || this.newObject.rights == "ROLE_PROJECT_OFFICER" || this.newObject.rights == "ROLE_FIELD_OFFICER") {
                if (this.newObject.projects == undefined) {
                    this.snackBar.open('You must defined at least a project with that role', '', { duration: 3000, horizontalPosition: 'right' });
                    return;
                }
            }
            else if (this.newObject.rights == "ROLE_REGIONAL_MANAGER" || this.newObject.rights == "ROLE_COUNTRY_MANAGER" || this.newObject.rights == "ROLE_READ_ONLY") {
                this.newObject.country = "KHM";
                if (this.newObject.country == undefined) {
                    this.snackBar.open('You must defined a country with that role', '', { duration: 3000, horizontalPosition: 'right' });
                    return;
                }
            }

            const checkMail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

            if (checkMail.test(this.newObject.username)) {
                // console.log('(dialog) Sent to format: ', this.newObject);
                const formatedObject = this.data.entity.formatFromModalAdd(this.newObject, this.loadedData);
                // console.log('(dialog) Return from format: ', formatedObject);
                this.onCreate.emit(formatedObject);
                this.closeDialog();
            }
            else
                this.snackBar.open('Invalid field : Email', '', { duration: 3000, horizontalPosition: 'right' });
        }
        else if ((this.newObject.fullname && this.newObject.shortname) || this.newObject.fullname == '' || this.newObject.shortname == '') {
            if (this.newObject.fullname == '' || this.newObject.shortname == '' || this.newObject.notes == '')
                this.snackBar.open('Invalid fields : check you filled every fields', '', { duration: 3000, horizontalPosition: 'right' });
            else {
                // console.log('(dialog) Sent to format: ', this.newObject);
                const formatedObject = this.data.entity.formatFromModalAdd(this.newObject, this.loadedData);
                // console.log('(dialog) Return from format: ', formatedObject);
                this.onCreate.emit(formatedObject);
                this.closeDialog();
            }
        }
        else if (this.newObject.start_date && this.newObject.end_date && this.newObject.name && this.newObject.notes && this.newObject.value) {
            if (this.newObject.start_date != '') {
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

            // console.log('(dialog) Sent to format: ', this.newObject);
            const formatedObject = this.data.entity.formatFromModalAdd(this.newObject, this.loadedData);
            // console.log('(dialog) Return from format: ', formatedObject);
            this.onCreate.emit(formatedObject);
            this.closeDialog();
        }
        else {
            // console.log('(dialog) Sent to format: ', this.newObject);
            const formatedObject = this.data.entity.formatFromModalAdd(this.newObject, this.loadedData);
            // console.log('(dialog) Return from format: ', formatedObject);
            this.onCreate.emit(formatedObject);
            this.closeDialog();
        }
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
