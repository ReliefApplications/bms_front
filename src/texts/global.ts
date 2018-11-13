import { TEXT as TEXT_FR } from "./global_fr";
import { TEXT as TEXT_EN } from "./global_en";
import { TEXT as TEXT_AR } from "./global_ar";

export class GlobalText {
    static language = 'en';
    static languages = ['en', 'fr', 'ar'];
    static TEXTS = TEXT_EN;

    static maxHeight = 700;
    static maxWidthMobile = 750;
    static maxWidthFirstRow = 1000;
    static maxWidthSecondRow = 800;
    static maxWidth = 750;

    public static changeLanguage(language : string = this.language) {
        GlobalText.language = language;
        const element = document.getElementsByTagName("mat-sidenav-content") as HTMLCollectionOf<HTMLElement>;
        switch (language) {
            case 'en':
                GlobalText.TEXTS = TEXT_EN;
                document.getElementsByTagName('html')[0].setAttribute('dir', '');
                element[0].style.margin = "0px 0px 0px 64px";

                break;
            case 'fr':
                GlobalText.TEXTS = TEXT_FR;
                document.getElementsByTagName('html')[0].setAttribute('dir', '');
                element[0].style.margin = "0px 0px 0px 64px";
                break;
            case 'ar':
                GlobalText.TEXTS = TEXT_AR;
                document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
                element[0].style.margin = "0px 64px 0px 0px";
                break;
            default: GlobalText.TEXTS = TEXT_EN; break;
        }
    }

    public static resetMenuMargin() {
        const element = document.getElementsByTagName("mat-sidenav-content") as HTMLCollectionOf<HTMLElement>;
        element[0].style.margin = "0px 0px 0px 0px";
    }
}