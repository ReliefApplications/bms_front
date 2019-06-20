import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import { Distribution } from 'src/app/models/distribution';

export class DistributionMarker {

    area: Leaflet.FeatureGroup;
    map: Leaflet.Map;
    marker: Leaflet.Layer;
    popup: HTMLElement;

    popupIsOpen = false;

    constructor (area: Leaflet.FeatureGroup, map: Leaflet.Map, distribution: Distribution) {
        this.area = area;
        this.map = map;
         // Calculate their center
         this.marker = Leaflet.marker(this.area.getBounds().getCenter(), {icon: this.generateIcon() });

        this.area.setStyle(this.generateAreaStyle());

        this.addPopup(distribution);
        this.addEventListeners();
    }

    private addEventListeners() {
        let hideTimeout: NodeJS.Timer;
        let popupTimeout: NodeJS.Timer;


//
// ─── MARKERS RELATED EVENTS LISTENERS ───────────────────────────────────────────
//
        // When the marker is hovered
        this.marker
        .on('mouseover', () => {
            // Display the area on the map
            this.map.addLayer(this.area);

            // Cancel the delayed hiding of the area and popup
            clearTimeout(hideTimeout);

            // Open the popup after a delay
            popupTimeout = setTimeout(() => {
                this.openPopup();
            }, 500);
        })
        // When the marker is not hovered anymore
        .on('mouseout', () => {
            // Hide the area and close the popup after a delay
            hideTimeout = setTimeout(() => {
                this.map.removeLayer(this.area);
                this.closePopup();
            }, 100);
        })
        // When the marker's popup is opened
        .on('popupopen', () => {
            this.popupIsOpen = true;
        })
        // When the marker's popup is closed
        .on('popupclose', () => {
            this.popupIsOpen = false;
        });


//
// ─── AREA RELATED EVENTS LISTENERS ──────────────────────────────────────────────
//
        this.area
        // When the area is hovered
        .on('mouseover', () => {
            // Cancel the delayed hiding of the area and popup
            clearTimeout(hideTimeout);

            // Open popup after a delay
            popupTimeout = setTimeout(() => {
                this.openPopup();
            }, 500);
        })
        // When the area is not hovered anymore
        .on('mouseout', () => {
            // Cancel popup if mouse leaves area
            clearTimeout(popupTimeout);

            // Remove area and popup on area exit, after a delay
            hideTimeout = setTimeout(() => {
                this.map.removeLayer(this.area);
                this.closePopup();
            }, 100);
        });


//
// ─── POPUP RELATED EVENTS LISTENERS ─────────────────────────────────────────────
//
        // When the popup is hovered
        this.popup.addEventListener('mouseover', () => {
            // Cancel the delayed hiding of the area and popup
            clearTimeout(hideTimeout);
        });

        // When the popup is not hovered anymore
        this.popup.addEventListener('mouseleave', () => {
            // Remove area and popup on area exit, after a delay
            hideTimeout = setTimeout(() => {
                this.map.removeLayer(this.area);
                this.closePopup();
            }, 100);
        });
    }

    private addPopup(distribution: Distribution) {
        this.popup = Leaflet.DomUtil.create('div', 'infoWindow');
        this.popup.innerHTML = `<p id="bms-popup">${distribution.get<string>('name')}</p>`;
        this.marker.bindPopup(this.popup);
    }

    private openPopup() {
        if (this.popupIsOpen) {
            return;
        }
        this.marker.openPopup();
    }

    private closePopup() {
        if (!this.popupIsOpen) {
            return;
        }
        this.marker.closePopup();
    }

    public addToMap() {
        this.map.addLayer(this.marker);
    }

    private generateAreaStyle(): Leaflet.PathOptions {
        return {
            stroke: false,
            fillOpacity: 0.8,
        };
    }

    private generateIcon() {
        return Leaflet.icon({
            iconUrl: 'assets/maps/marker.png',
            iconSize:       [74, 74], // size of the icon
            iconAnchor:     [37, 74], // position of the icon
            popupAnchor:    [0 , -30],
        });
    }
}
