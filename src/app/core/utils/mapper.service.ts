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
    setMapperObject(entity): Object{
        console.log(entity);
        console.log(entity.__classname__);
        switch(entity.__classname__){
            case 'DistributionData' :
            this.mapperObject = this.mapper.getEntityTranslator("distribution_data"); break;
            case 'Donor' :
            this.mapperObject = this.mapper.getEntityTranslator("donor"); break;
            case 'Project' :
            this.mapperObject = this.mapper.getEntityTranslator("project"); break;
            case 'UserInterface' :
            this.mapperObject = this.mapper.getEntityTranslator("user"); break;
            case 'CountrySpecific' :
            this.mapperObject = this.mapper.getEntityTranslator("country_specific"); break;
            case 'Households' :
            this.mapperObject = this.mapper.getEntityTranslator("households"); break;
            default: return;
        }
        return this;
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
