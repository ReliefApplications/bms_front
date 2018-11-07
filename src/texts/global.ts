import { TEXT as TEXT_FR} from "./global_fr";
import { TEXT as TEXT_EN} from "./global_en";
import { TEXT as TEXT_AR} from "./global_ar";

export class GlobalText {
    static language = 'en';
    static languages = ['en', 'fr', 'ar'];
    static TEXTS = TEXT_EN;
   
    static maxHeight = 700;
    static maxWidthMobile = 750;
    static maxWidthFirstRow = 1000;
    static maxWidthSecondRow = 800;
    static maxWidth = 750;
    
    public static changeLanguage(language : string){
       GlobalText.language = language;
       switch(language){
        case 'en':  GlobalText.TEXTS = TEXT_EN; break;
        case 'fr': GlobalText.TEXTS = TEXT_FR; break;
        case 'ar': GlobalText.TEXTS = TEXT_AR; break;
        default: GlobalText.TEXTS = TEXT_EN; break;
        }
    }
}