import * as Leaflet from 'leaflet';
import { AppInjector } from 'src/app/app-injector';
import { LanguageService } from '../language/language.service';
import { UppercaseFirstPipe } from 'src/app/shared/pipes/uppercase-first.pipe';

export class Legend {
    legend = new Leaflet.Control({position: 'bottomleft'});
    protected languageService = AppInjector.get(LanguageService);

    // Language
    protected language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    constructor(marker: string) {
        const titlePipe = new UppercaseFirstPipe();


        this.legend.onAdd = (map) => {
            const div = Leaflet.DomUtil.create('div', 'legend');
            div.innerHTML = `
            <p class="not-validated">
                ${marker} <span>${titlePipe.transform(this.language.map_legend_not_validated)}</span>
            </p>
            <p class="validated">
                ${marker} <span>${titlePipe.transform(this.language.map_legend_validated)}</span>
            </p>
            <p class="completed">
                ${marker} <span>${titlePipe.transform(this.language.map_legend_completed)}</span>
            </p>
            `;
            return div;
        };
    }
}
