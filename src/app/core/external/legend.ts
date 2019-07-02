import * as Leaflet from 'leaflet';

export class Legend {
    legend = new Leaflet.Control({position: 'bottomleft'});

    constructor(marker: string) {

        this.legend.onAdd = (map) => {
            const div = Leaflet.DomUtil.create('div', 'legend');
            div.innerHTML = `
            <p class="not-validated">
                ${marker} <span>Not validated</span>
            </p>
            <p class="validated">
                ${marker} <span>Validated</span>
            </p>
            <p class="completed">
                ${marker} <span>Completed</span>
            </p>
            `;
            return div;
        };
    }
}
