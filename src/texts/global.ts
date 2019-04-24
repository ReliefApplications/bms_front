import { English } from './global_en';
import { Language } from './language';

export class GlobalText {
    static language = 'en';
    static languages = ['en', 'ar'];
    static TEXTS = English;
    static country;

    static maxHeight = 700;
    static maxWidthMobile = 750;
    static maxWidthFirstRow = 1000;
    static maxWidthSecondRow = 800;
    static maxWidth = 750;

    public static changeLanguage(language: Language) {
        // GlobalText.language = language;
        this.adaptMargin();
    }

    private static adaptMargin() {
        const element = document.getElementsByTagName('mat-sidenav-content') as HTMLCollectionOf<HTMLElement>;

        if (window.innerHeight > this.maxHeight || window.innerWidth > this.maxWidth) {
            if (this.language === 'ar') {
                document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
                element[0].style.margin = '0px 64px 0px 0px';
            } else {
                document.getElementsByTagName('html')[0].setAttribute('dir', '');
                element[0].style.margin = '0px 0px 0px 64px';
            }
        } else {
            this.resetMenuMargin();
        }
    }

    public static resetMenuMargin() {
        const element = document.getElementsByTagName('mat-sidenav-content') as HTMLCollectionOf<HTMLElement>;
        element[0].style.margin = '0px 0px 0px 0px';
    }
}
