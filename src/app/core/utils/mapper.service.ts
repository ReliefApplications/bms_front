import { Injectable             } from '@angular/core';

import { FieldMapper            } from '../../model/field-mapper';

@Injectable({
	providedIn: 'root'
})
export class Mapper{
    mapper:FieldMapper = new FieldMapper();
    entityInstance = null;
    mapperObject = null;

    constructor(){

    }

    instantiate(classToken){
        let instance = Object.create(classToken.prototype);
        instance.constructor.apply(instance);
        return this.entityInstance = instance;
    }

    /**
    * set mapperObject with its properties set with the entity translator
    */
    setMapperObject(entity){
        this.mapperObject = this.findMapperObject(entity);
    }

    findMapperObject(entity): Object{
        switch(entity.__classname__){
            case 'DistributionData' :
                return this.mapper.getEntityTranslator("distribution_data");
            case 'Donor' :
                return this.mapper.getEntityTranslator("donor");
            case 'Criteria' :
                return this.mapper.getEntityTranslator("criteria");
            case 'Project' :
                return this.mapper.getEntityTranslator("project");
            case 'UserInterface' :
                return this.mapper.getEntityTranslator("user");
            case 'CountrySpecific' :
                return this.mapper.getEntityTranslator("country_specific");
            case 'Households' :
                return this.mapper.getEntityTranslator("households");
            case 'Commodity' :
                return this.mapper.getEntityTranslator("commodity");
            default: return;
        }
    }

    getMapperObject(): Object{
        return this.mapperObject;
    }

    /**
    * return the displayed name of a mapperObject's property if the property exists
    */
    mapTitle(column): Object{
        let mapperObject = this.getMapperObject();
        return mapperObject ? mapperObject[column] : '';
    }

    /**
    * return the formmatted value of a property p of the object element
    */
    mapValue(element, p){
        let elementObject = this.entityInstance.getMapper(element);
        if(!elementObject)
            return p;
        return elementObject[p];
    }

    /**
    * return the formmatted value of a property p of the object element
    * the formatting is for modal details
    */
    mapValueDetails(element, p){
        return this.entityInstance.getMapperDetails(element)[p];
    }
}
