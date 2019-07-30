import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import { AppInjector } from 'src/app/app-injector';
import { Distribution } from 'src/app/models/distribution';
import { DistributionMarkerService } from './distribution-marker.service';

export class DistributionMarker {

    area: Leaflet.FeatureGroup;
    map: Leaflet.Map;
    marker: Leaflet.Layer;
    popup: HTMLElement;

    private readonly iconSize = {
        width: 40,
        height: 56,
    };

    popupIsOpen = false;
    private distributionMarkerService: DistributionMarkerService;

    constructor(area: Leaflet.FeatureGroup, map: Leaflet.Map, distribution: Distribution) {
        this.distributionMarkerService = AppInjector.get(DistributionMarkerService);

        this.area = area;
        this.map = map;
        // Calculate their center
        this.marker = Leaflet.marker(this.area.getBounds().getCenter(), { icon: this.generateIcon(distribution) });

        this.area.setStyle(this.generateAreaStyle());

        this.addPopup(distribution);
    }


    private addPopup(distribution: Distribution) {
        this.popup = this.distributionMarkerService.getPopup(distribution);
        this.marker.bindPopup(this.popup);
    }

    public addToMap() {
        this.map.addLayer(this.marker);
    }

    private generateAreaStyle(): Leaflet.PathOptions {
        return {
            stroke: false,
            // Hide the area from the map, change this to display it
            fillOpacity: 0,
        };
    }

    private generateIcon(distribution: Distribution) {
        const { width, height } = this.iconSize;
        const status = this.distributionMarkerService.getClassesNames(distribution);
        return Leaflet.divIcon({
            className: `marker-container ${status}`,
            html: `
                <object class="marker-icon" width="20" height="20" fill="white"
                    data="${this.distributionMarkerService.getImage(distribution)}">
                </object>
                ${this.distributionMarkerService.generateMarker(this.distributionMarkerService.isToday(distribution))}
            `,
            // 0,0 is the top left corner of the icon
            iconSize: [width, height], // size of the icon
            iconAnchor: [width / 2, height], // Position of the location relative to the icon
            popupAnchor: [0, - height + 5], // Position of the popup relative to the iconAnchor
        });
    }
}
