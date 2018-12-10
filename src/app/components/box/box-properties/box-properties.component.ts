import { Component, HostListener, OnInit, Input } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FieldMapper } from '../../../model/field-mapper';
import { CountoModule } from 'angular2-counto';

@Component({
    selector: 'app-box-properties',
    templateUrl: './box-properties.component.html',
    styleUrls: ['./box-properties.component.scss']
})
export class BoxPropertiesComponent {
    public box = GlobalText.TEXTS;
    mapper: FieldMapper = new FieldMapper();
    mapperObject = null;
    elementObject = null;

    @Input() componentDisplayed;
    @Input() mapperService;
    @Input() entity;
    @Input() data;
    private oldComponentDisplayed = null;
    public properties: any;
    public numColumns = 0;
    public displayLength: number;
    
    readonly MAX_PROP_LENGTH = 20;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.numberOfColumns();
    }

    ngOnInit() {
        let entityInstance = Object.create(this.entity.prototype);
        entityInstance.constructor.apply(entityInstance);
        this.mapperObject = this.mapperService.findMapperObject(this.entity);
        this.properties = Object.getOwnPropertyNames(entityInstance.getMapperBox(entityInstance));
        this.numberOfColumns();
        this.elementObject = entityInstance.getMapperBox(this.componentDisplayed);
    }

    ngDoCheck() {
        if (this.box != GlobalText.TEXTS) {
            this.box = GlobalText.TEXTS;
            this.mapperObject = this.mapperService.findMapperObject(this.entity);
            this.oldComponentDisplayed = null;
        }
        if (this.componentDisplayed != this.oldComponentDisplayed) {
            let entityInstance = Object.create(this.entity.prototype);
            entityInstance.constructor.apply(entityInstance);
            this.elementObject = entityInstance.getMapperBox(this.componentDisplayed);
            this.oldComponentDisplayed = this.componentDisplayed;
        }

        if (this.data && this.elementObject.number_beneficiaries != this.data.length) {
            this.elementObject.number_beneficiaries = this.data.length;
            this.componentDisplayed.distribution_beneficiaries = this.data;
        }
    }

    cleanUsefullProperties() {
        let cleaned = new Array();

        this.properties.forEach(
            element => {
                if (element && this.elementObject[element] !== '' && this.elementObject[element] !== {} && this.elementObject[element] !== undefined) {
                    cleaned.push(element);
                }
            }
        );

        this.properties = cleaned;
    }

    isArray(obj: any) {
        return Array.isArray(obj)
    }

    isNumber(obj: any) {
        return (typeof (obj) === "number")
    }

    numberOfColumns(): void {
        let length = Object.keys(this.properties).length;
        if (window.innerWidth > 700) {
            this.numColumns = length;
        }
        else if (window.innerWidth > 400 && window.innerWidth < 700) {
            this.numColumns = length / 2;
        }
        else {
            this.numColumns = length / 3;
        }
    }
}
