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

    setMapperObject(entity){
        switch(entity.__classname__){
            case 'DistributionData' :
            this.mapperObject = this.mapper.distribution_data; break;

        default: return;
        }
        return this;
    }

    getMapperObject(){
        return this.mapperObject;
    }

    mapTitle(column){
        let mapperObject = this.getMapperObject();
        return mapperObject ? mapperObject[column] : '';
    }

    mapValue(value, p){
        return this.entityInstance.getMapper(value)[p];
    }
}
