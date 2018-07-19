import { TEXT as TEXT_FR} from "./global_fr";
import { TEXT as TEXT_EN} from "./global_en";

export class GlobalText {
    
    public static translate(langage : string){
        switch(langage){
            case 'en':
                return TEXT_EN;
            case 'fr':
                return TEXT_FR;
            default: return TEXT_EN;
        }
    }
}