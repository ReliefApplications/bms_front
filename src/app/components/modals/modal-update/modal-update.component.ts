import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { Donor } from '../../../model/donor';

import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { CustomDateAdapter, APP_DATE_FORMATS } from 'src/app/core/utils/date.adapter';

@Component({
    selector: 'app-modal-update',
    templateUrl: './modal-update.component.html',
    styleUrls: ['../modal.component.scss', './modal-update.component.scss'],
    providers: [
        { provide: DateAdapter, useClass: CustomDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
    ]
})
export class ModalUpdateComponent extends ModalComponent implements OnInit {

    @Input() data: any;
    @Output() onUpdate = new EventEmitter();
    updateObject: any;

    ngOnInit() {
        this.entityInstance = this.data.mapper.instantiate(this.data.entity);
        this.properties = Object.getOwnPropertyNames(this.entityInstance.getMapperUpdate(this.entityInstance, this.data.data));

        this.propertiesTypes = this.entityInstance.getModalTypeProperties(this.entityInstance);
        try {
            this.updateObject = this.entityInstance.mapAllProperties(this.data.data);
        } catch (e) {
            console.error('the function mapAllProperties is not defined for the entity ', this.entityInstance);
        }
        if (this.updateObject.salted_password) {
            this.updateObject.salted_password = '';
        }
        this.loadData(this.updateObject);
        if (this.updateObject.email && this.updateObject.username) {
            this.form.controls['emailFormControl'].disable();

            const re = /\ /gi;
            this.updateObject.rights = this.updateObject.rights.replace(re, '');

            if (this.updateObject.rights === 'ROLE_PROJECT_MANAGER' || this.updateObject.rights === 'ROLE_PROJECT_OFFICER' ||
            this.updateObject.rights === 'ROLE_FIELD_OFFICER') {
                this.form.controls['projectsControl'].enable();
            }

            if (this.updateObject.rights === 'ROLE_COUNTRY_MANAGER' || this.updateObject.rights === 'ROLE_REGIONAL_MANAGER') {
                this.form.controls['countryControl'].enable();
            }
        }
    }

  selected(updateObject) {
      if (updateObject === 'ROLE_PROJECT_MANAGER' || updateObject === 'ROLE_PROJECT_OFFICER' || updateObject === 'ROLE_FIELD_OFFICER') {
          this.updateObject['country'] = [];
          this.updateObject['projects'] = [];

          this.form.controls['projectsControl'].enable();
          this.form.controls['countryControl'].disable();
      } else if (updateObject === 'ROLE_COUNTRY_MANAGER' || updateObject === 'ROLE_REGIONAL_MANAGER') {
          this.updateObject['country'] = [];
          this.updateObject['projects'] = [];

          this.form.controls['countryControl'].enable();
          this.form.controls['projectsControl'].disable();
      } else {
          this.updateObject['country'] = [];
          this.updateObject['projects'] = [];

          this.form.controls['projectsControl'].disable();
          this.form.controls['countryControl'].disable();
      }

      // TODO check if necessary
      if (updateObject === 'ROLE_ADMIN') {
          this.user.getAllCountries().forEach(
              element => {
                  this.updateObject['country'].push(element.id);
              }
          );
      }
  }

    /**
     * emit the object updated
     */
    save(): any {
        // Check fields for Users settings
        if (this.updateObject.username && this.updateObject.rights) {

            // if (this.updateObject.password == '' || !this.updateObject.password) {
            //   this.snackBar.open(this.modal.modal_no_password, '', { duration: 5000, horizontalPosition: 'right' });
            //   return;
            // }
            if (this.updateObject.password && this.updateObject.password !== '') {
                if (!this.passwordRegex.test(this.updateObject.password)) {
                    this.snackBar.open(this.modal.modal_not_enough_strong, '', { duration: 5000, horizontalPosition: 'right' });
                    return;
                }
            }

            if (this.updateObject.rights === 'ROLE_PROJECT_MANAGER' || this.updateObject.rights === 'ROLE_PROJECT_OFFICER' ||
            this.updateObject.rights === 'ROLE_FIELD_OFFICER') {
                if (this.updateObject.projects === undefined || Object.keys(this.updateObject.projects).length === 0) {
                    this.snackBar.open(this.modal.modal_no_project, '', { duration: 5000, horizontalPosition: 'right' });
                    return;
                }
            } else if (this.updateObject.rights === 'ROLE_REGIONAL_MANAGER' || this.updateObject.rights === 'ROLE_COUNTRY_MANAGER' ||
            this.updateObject.rights === 'ROLE_READ_ONLY') {
                if (this.updateObject.country === undefined) {
                    this.snackBar.open(this.modal.modal_no_country, '', { duration: 5000, horizontalPosition: 'right' });
                    return;
                }
            }

            if (this.updateObject.projects && !this.updateObject.projects[0]) {
                const tmpProject = this.updateObject.projects.id;
                this.updateObject.projects = [];

                this.updateObject.projects.push(tmpProject);
            } else if (this.updateObject.projects) {
                const projects = [];

                this.updateObject.projects.forEach(project => {
                    projects.push(project.id);
                });

                this.updateObject.projects = projects;
            }

            if (this.updateObject.country && !this.updateObject.country[0]) {
                const tmpCountry = this.updateObject.country.id;
                this.updateObject.country = [];

                this.updateObject.country.push(tmpCountry);
            } else if (this.updateObject.country) {
                const countries = [];

                if (typeof this.updateObject.country === 'string') {
                    this.updateObject.country = [this.updateObject.country];
                }

                this.updateObject.country.forEach(country => {
                    countries.push(country);
                });

                this.updateObject.country = countries;
            }
        } else if ((this.updateObject.countryIso3 && this.updateObject.field && this.updateObject.type) ||
        this.updateObject.countryIso3 === '' || this.updateObject.field === '') {
            if (this.updateObject.field === '' || this.updateObject.type === '') {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
        } else if ((this.updateObject.fullname && this.updateObject.shortname) || this.updateObject.fullname === '' ||
        this.updateObject.shortname === '') {
            if (this.updateObject.fullname === '' || this.updateObject.shortname === '') {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
        } else if ((this.updateObject.end_date && this.updateObject.start_date && this.updateObject.iso3)) {
            if (!this.updateObject.end_date || !this.updateObject.name || !this.updateObject.start_date || !this.updateObject.value) {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            if (new Date(this.updateObject.start_date).getTime() >= new Date(this.updateObject.end_date).getTime()) {
                this.snackBar.open(this.modal.modal_check_date, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            if (typeof this.updateObject.start_date === 'object') {
                let day = this.updateObject.start_date.getDate();
                let month = this.updateObject.start_date.getMonth() + 1;
                const year = this.updateObject.start_date.getFullYear();

                if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                this.updateObject.start_date = year + '-' + month + '-' + day;
            }

            if (typeof this.updateObject.end_date === 'object') {
                let day = this.updateObject.end_date.getDate();
                let month = this.updateObject.end_date.getMonth() + 1;
                const year = this.updateObject.end_date.getFullYear();

                if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                this.updateObject.end_date = year + '-' + month + '-' + day;
            }
        }

        // Check fields for Financial Provider in settings
        else if (this.updateObject && this.updateObject.username && !this.updateObject.shop) {
            if (this.updateObject.username === '' || this.updateObject.password === '' || !this.updateObject.password) {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
        }

        // Check fields for Vendors in settings
        else if (this.updateObject && (this.updateObject.shop || this.updateObject.shop === '')) {
            if (
                this.updateObject.name === '' ||
                this.updateObject.shop === '' ||
                this.updateObject.address === '' ||
                this.updateObject.username === '' ||
                this.updateObject.password === ''
            ) {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }
        }

        // Check fields for update distribution
        else if (this.updateObject.date_distribution) {
            if (!this.updateObject.date_distribution || !this.updateObject.name) {
                this.snackBar.open(this.modal.modal_check_fields, '', { duration: 5000, horizontalPosition: 'right' });
                return;
            }

            if (typeof this.updateObject.date_distribution === 'object') {
                let day = this.updateObject.date_distribution.getDate();
                let month = this.updateObject.date_distribution.getMonth() + 1;
                const year = this.updateObject.date_distribution.getFullYear();

                if (day < 10) {
                    day = '0' + day;
                }
                if (month < 10) {
                    month = '0' + month;
                }
                this.updateObject.date_distribution = year + '-' + month + '-' + day;
            }
        }

        this.onUpdate.emit(this.updateObject);
        this.closeDialog();
    }

    isDisabled(property) {
        if (property === 'location_name' || property === 'number_beneficiaries'
            || property === 'name' || property === 'shop' || (property === 'username' && this.data.entity.__classname__ === 'Vendors')) {
            return true;
        } else {
            return false;
        }
    }

    handleCheckbox() {
        if (this.data.entity.__classname__ === 'Booklet') {
            if (this.updateObject.individual_to_all) {
                const individual_values = new Array(this.updateObject.number_vouchers);
                const individual_value = this.updateObject.individual_value ? this.updateObject.individual_value : 1;
                individual_values.fill(individual_value);
                this.updateObject.individual_values = individual_values;
                this.updateObject.individual_value = null;
            } else {
                this.updateObject.individual_value = this.updateObject.individual_values ? this.updateObject.individual_values[0] : 1;
                this.updateObject.individual_values = null;
            }
        }
    }

    handleChangeNumberVouchers() {
        if (this.updateObject.individual_to_all) {
            if (this.updateObject.individual_values.length > this.updateObject.number_vouchers) {
                while (this.updateObject.individual_values.length > this.updateObject.number_vouchers) {
                    this.updateObject.individual_values.pop();
                }
            } else if (this.updateObject.individual_values.length < this.updateObject.number_vouchers) {
                while (this.updateObject.individual_values.length < this.updateObject.number_vouchers) {
                    const value = this.updateObject.individual_values[0] ? this.updateObject.individual_values[0] : 1;
                    this.updateObject.individual_values.push(value);
                }
            }
        }
    }

    trackByFn(i: number) {
        return i;
      }
}
