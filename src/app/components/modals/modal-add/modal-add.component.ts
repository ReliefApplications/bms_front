import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ModalComponent } from '../modal.component';
import { GlobalText } from '../../../../texts/global';
import { Criteria } from '../../../model/criteria';
import { Commodity } from '../../../model/commodity';
import { MatSnackBar } from '@angular/material';
import { count } from '@swimlane/ngx-charts';

@Component({
    selector: 'app-modal-add',
    templateUrl: './modal-add.component.html',
    styleUrls: ['./modal-add.component.scss']
})
export class ModalAddComponent extends ModalComponent {
    public entityDisplayedName = '';
    public oldEntity = '';
    mapperObject = null;

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

    selected(selectedField) {
        if (selectedField.modality) {
            if (selectedField.modality !== this.oldSelectedModality) {
                this.getModalityType(selectedField.modality);
                this.oldSelectedModality = selectedField.modality;
            }
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
        else if ((this.newObject.fullname && this.newObject.shortname) || this.newObject.fullname == '' || this.newObject.shortname == ''){
            if(this.newObject.fullname == '' || this.newObject.shortname == '' || this.newObject.notes == '' || this.newObject.projects_name.length == 0)
                this.snackBar.open('Invalid fields : check you filled every fields', '', { duration: 3000, horizontalPosition: 'right' });
            else{
                // console.log('(dialog) Sent to format: ', this.newObject);
                const formatedObject = this.data.entity.formatFromModalAdd(this.newObject, this.loadedData);
                console.log('(dialog) Return from format: ', formatedObject);
                this.onCreate.emit(formatedObject);
                this.closeDialog();
            }
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
