import { Component, HostListener, OnInit, DoCheck, Input } from '@angular/core';
import { GlobalText } from '../../../../texts/global';
import { FieldMapper } from '../../../model/field-mapper';
import { CountoModule } from 'angular2-counto';
import { CustomModel } from 'src/app/model/CustomModel/custom-model';

@Component({
    selector: 'app-box-properties',
    templateUrl: './box-properties.component.html',
    styleUrls: ['./box-properties.component.scss']
})
export class BoxPropertiesComponent implements OnInit, DoCheck {
    public box = GlobalText.TEXTS;
    mapper: FieldMapper = new FieldMapper();
    mapperObject = null;
    elementObject = null;
    // Todo: Remove this
    @Input() componentDisplayed;
    // Todo: Remove this
    @Input() mapperService;
    // Todo: Remove this
    @Input() entity;
    // Todo: Remove this
    @Input() data;
    // Todo: Remove this
    @Input() displayedInstance: CustomModel;

    private oldComponentDisplayed = null;
    public displayedPropertyNames: any;
    public numColumns = 0;
    public displayLength: number;

    readonly MAX_PROP_LENGTH = 20;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.getNumberOfColumns();
    }

    ngOnInit() {
        const allPropertyNames = Object.keys(this.displayedInstance.fields);
        this.displayedPropertyNames = allPropertyNames.filter(property => {
            return this.displayedInstance.fields[property].isDisplayedInSummary === true;
        });
        this.getNumberOfColumns();
    }

    ngDoCheck() {
        if (this.box !== GlobalText.TEXTS) {
            this.box = GlobalText.TEXTS;
            this.mapperObject = this.mapperService.findMapperObject(this.entity);
            this.oldComponentDisplayed = null;
        }
        // if (this.displayedInstance !== this.oldComponentDisplayed) {
        //     const entityInstance = Object.create(this.entity.prototype);
        //     entityInstance.constructor.apply(entityInstance);
        //     this.elementObject = entityInstance.getMapperBox(this.displayedInstance);
        //     this.oldComponentDisplayed = this.displayedInstance;
        // }

        // if (this.data && this.elementObject.number_beneficiaries !== this.data.length) {
        //     this.elementObject.number_beneficiaries = this.data.length;
        //     this.displayedInstance.distribution_beneficiaries = this.data;
        // }
    }

    cleanUsefullProperties() {
        const cleaned = new Array();

        this.displayedPropertyNames.forEach(
            element => {
                if (element && this.elementObject[element] !== ''
                && this.elementObject[element] !== {} && this.elementObject[element] !== undefined) {
                    cleaned.push(element);
                }
            }
        );

        this.displayedPropertyNames = cleaned;
    }

    isArray(obj: any) {
        return Array.isArray(obj);
    }

    isNumber(obj: any) {
        return (typeof (obj) === 'number');
    }

    getNumberOfColumns(): void {
        const length = Object.keys(this.displayedPropertyNames).length;
        if (window.innerWidth > 700) {
            this.numColumns = length;
        } else if (window.innerWidth > 400 && window.innerWidth < 700) {
            this.numColumns = length / 2;
        } else {
            this.numColumns = length / 3;
        }
    }
}
