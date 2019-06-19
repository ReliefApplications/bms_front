import { Injectable } from '@angular/core';
import * as LeafletOmnivore from '@mapbox/leaflet-omnivore';
// Plugins
import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import { Distribution } from 'src/app/models/distribution';
import { DistributionService } from '../api/distribution.service';
import { CountriesService } from '../countries/countries.service';

const distributionIcon = Leaflet.icon({
    iconUrl: '/assets/images/settings/country_specific.png',
    iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
@Injectable({
    providedIn: 'root'
})

export class LeafletService {

    public loading = false;
    private map: any;
    private tiles: any;

    constructor(
        private distributionService: DistributionService,
        private countriesService: CountriesService,
    ) { }

    // ------------------------------------------------------------------------ //
    // ---------------------------------- MAP --------------------------------- //
    // ------------------------------------------------------------------------ //

    createMap(mapId: string) {
        // Create map
        this.map = Leaflet.map(mapId, {
            zoom: 8,
            maxZoom: 11,
            minZoom: 3,           // Too see the whole world on small screens
            zoomControl: true,        // Display the + and - buttons for the zoom
            zoomAnimation: true,        // Smooth transition of zoom
            trackResize: true,        // Keep the center of the map if the window is resized
            doubleClickZoom: true,        // To zoom on the pointer position and not on the center of the map
            dragging: true,         // Enable the dragging of the map
            scrollWheelZoom: false,
            layers: []
        });

        this.map.once('click', () => { this.map.scrollWheelZoom.enable(); });
        this.addTileLayer();
        this.addKML();
        this.map.setView([51.505, -0.09], 13);
    }

    removeMap() {
        this.map.remove();
    }

    addTileLayer() {
        // Add title layer to the map

        this.tiles = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    setTileLayer() {
        this.tiles.remove();
        this.addTileLayer();
    }

    // add all layers to show the upcoming distribution in the map dashoard
    addKML() {
        const country = this.countriesService.selectedCountry.value;
        let markers = this.initializeFeatureGroup();
        const admLayers = LeafletOmnivore.kml('assets/maps/map_' + country.fields.id.value.toLowerCase() + '.kml').on('ready', () => {
            // Center view on country
            this.map.fitBounds(admLayers.getBounds());

            // Get all upcoming distributions
            this.distributionService.get().subscribe((apiDistributions: Array<any>) => {

                // Remove previous markers
                this.map.removeLayer(markers);
                // Empty markers
                markers = this.initializeFeatureGroup();
                // Format distributions
                const distributions = apiDistributions.map((apiDistribution: any) => {
                    return Distribution.apiToModel(apiDistribution);
                });

                // Find regions corresponding to distribution
                distributions.forEach((distribution: Distribution) => {
                    const admGroup = new Leaflet.FeatureGroup();

                    admLayers.eachLayer((layer: any) => {
                        // Fill an array containing all the adm of the current layer
                        const kmlAdm = [
                            layer.feature.properties.ADM0_PCODE,
                            layer.feature.properties.ADM1_PCODE,
                            layer.feature.properties.ADM2_PCODE,
                            layer.feature.properties.ADM3_PCODE ,
                        ];
                        // Group all the matching adm4 layers
                        if (this.compareAdmToMapDistribution(kmlAdm, distribution.get('location').get<string>('code'))) {
                            admGroup.addLayer(layer);
                        }
                    });
                    const distributionMarker = new DistributionMarker(admGroup, this.map, distribution);
                    markers.addLayer(distributionMarker.marker);


                });
                // Add the marker to the cluster

                // Add it to the map
                markers.addTo(this.map);

            });

        });
    }

    // Compare the kml layer's location to the distribution's code recursively
    compareAdmToMapDistribution(adm: Array<string>, distribution_adm: string): boolean {
        const admLevel = this.getAdmLevel(distribution_adm);
        // If an adm is missing in the location layer, retry with a broader region
        if (! adm[admLevel]) {
            return this.compareAdmToMapDistribution(adm, distribution_adm.substr(0, distribution_adm.length - 2));
        }
        return adm[admLevel] === distribution_adm;
    }


    getAdmLevel(admCode: string) {
        // Remove 2-character identifier and calculate adm based on the code's length
        const admLevel = admCode.slice(2).length / 2;
        if (!Number.isInteger(admLevel)) {
            throw new Error(`${admCode} is not an integer`);
        }
        return admLevel;
    }

    initializeFeatureGroup() {
        return Leaflet.markerClusterGroup({
            // spiderfyOnMaxZoom: true,
            // showCoverageOnHover: true,
            // iconCreateFunction: (cluster: Leaflet.MarkerCluster) => {
            //     return Leaflet.divIcon({
            //         html: `${cluster.getChildCount()}`,
            //         className: 'cluster',
            //     });
            // }
        });
    }


}


class DistributionMarker {

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

    private generateIcon() {
        return Leaflet.icon({
            iconUrl: 'assets/maps/marker.png',
            iconSize:       [74, 74], // size of the icon
            iconAnchor:     [37, 74], // position of the icon
            popupAnchor:    [0 , -30],
        });
    }
}
