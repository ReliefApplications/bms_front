import { Injectable } from '@angular/core';
import { FieldMapper } from '../../model/field-mapper';
import { DatePipe } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class Mapper {
    mapper: FieldMapper = new FieldMapper();
    entityInstance = null;
    mapperObject = null;

    constructor(public datepipe: DatePipe) {

    }

    instantiate(classToken) {
        const instance = Object.create(classToken.prototype);
        instance.constructor.apply(instance);
        return this.entityInstance = instance;
    }

    /**
    * set mapperObject with its properties set with the entity translator
    */
    setMapperObject(entity) {
        this.mapperObject = this.findMapperObject(entity);
    }

    findMapperObject(entity): Object {
        switch (entity.__classname__) {
            case 'DistributionData':
                return this.mapper.getEntityTranslator('distribution_data');
            case 'Donor':
                return this.mapper.getEntityTranslator('donor');
            case 'Criteria':
                return this.mapper.getEntityTranslator('criteria');
            case 'Project':
                return this.mapper.getEntityTranslator('project');
            case 'User':
                return this.mapper.getEntityTranslator('user');
            case 'CountrySpecific':
                return this.mapper.getEntityTranslator('country_specific');
            case 'Households':
                return this.mapper.getEntityTranslator('households');
            case 'Commodity':
                return this.mapper.getEntityTranslator('commodity');
            case 'Beneficiaries':
                return this.mapper.getEntityTranslator('beneficiaries');
            case 'ImportedBeneficiary':
                return this.mapper.getEntityTranslator('imported_beneficiary');
            case 'TransactionBeneficiary':
                return this.mapper.getEntityTranslator('transaction_beneficiary');
            case 'Financial Provider':
                return this.mapper.getEntityTranslator('financial_provider');
            case 'Booklet':
                return this.mapper.getEntityTranslator('booklet');
            case 'TransactionVoucher':
                return this.mapper.getEntityTranslator('transaction_voucher');
            case 'Vendors':
                return this.mapper.getEntityTranslator('vendors');
            default: return;
        }
    }

    getMapperObject(): Object {
        return this.mapperObject;
    }

    /**
    * return the displayed name of a mapperObject's property if the property exists
    */
    mapTitle(column): Object {
        const mapperObject = this.getMapperObject();
        return mapperObject ? mapperObject[column] : '';
    }

    /**
    * return the formmatted value of a property p of the object element
    */
    mapValue(element, p) {

        const elementObject = this.entityInstance.getMapper(element);
        if (!elementObject) {
            return p;
        }
        if (p === 'date_distribution' || p === 'start_date' || p === 'end_date') {
            return this.datepipe.transform(elementObject[p], 'dd-MM-yyyy');
        } else {
            return elementObject[p];
        }

    }

    /**
    * return the formmatted value of a property p of the object element
    * the formatting is for modal details
    */
    mapValueDetails(element, p) {
        return String(this.entityInstance.getMapperDetails(element)[p]);
    }
}
