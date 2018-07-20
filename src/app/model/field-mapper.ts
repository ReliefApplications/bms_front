import { DistributionData                                  } from "./distribution-data";
import { Donor                                             } from "./donor";
import { Project                                           } from "./project";
import { UserInterface                                     } from "./interfaces";
import { CountrySpecific                                   } from "./country-specific";
import { Households                                        } from "./households";

export class FieldMapper{

    public getEntityTranslator(entityName : string){
        switch(entityName){
            case 'distribution_data': return DistributionData.translator();
            case 'donor' : return Donor.translator();
            case 'project' : return Project.translator();
            case 'user' : return UserInterface.translator();
            case 'country_specific' : return CountrySpecific.translator();
            case 'households' : return Households.translator();
        }
    }
}
