import { TEXT as TEXT_FR} from "./global_fr";
import { TEXT as TEXT_EN} from "./global_en";

export class GlobalText {
    static language = 'en';
    static TEXTS = TEXT_EN;
    
    public static changeLanguage(language : string){
       GlobalText.language = language;
       switch(language){
        case 'en':  GlobalText.TEXTS = TEXT_EN; break;
        case 'fr': GlobalText.TEXTS = TEXT_FR; break;
        default: GlobalText.TEXTS =TEXT_EN; break;
        }
    }
}