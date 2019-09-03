import { Injectable } from '@angular/core';
import * as LeafletOmnivore from '@mapbox/leaflet-omnivore';
// Plugins
import * as Leaflet from 'leaflet';
import 'leaflet.markercluster';
import { Distribution } from 'src/app/models/distribution';
import { CountriesService } from '../countries/countries.service';
import { DistributionMarker } from './distribution-marker';
import { DistributionMarkerService } from './distribution-marker.service';
import { Legend } from './legend';


@Injectable({
    providedIn: 'root'
})

export class MapService {

    public loading = false;
    private map: any;
    private tiles: any;

    constructor(
        private countriesService: CountriesService,
        private distributionMarkerService: DistributionMarkerService
    ) { }

    createMap(mapId: string) {
        // Create map
        this.map = Leaflet.map(mapId, {
            zoom: 8,
            maxZoom: 11,
            minZoom: 3,           // Too see the whole world on small screens
            zoomControl: true,        // Display the + and - buttons for the zoom
            zoomAnimation: true,        // Smooth transition of zoom
            zoomSnap: 0.5,              // To avoid overzooming on clusters
            zoomDelta: 1,           // To zoomm normally with + and -
            trackResize: true,        // Keep the center of the map if the window is resized
            doubleClickZoom: true,        // To zoom on the pointer position and not on the center of the map
            dragging: true,         // Enable the dragging of the map
            scrollWheelZoom: true,
            layers: [],
        });
        this.addTileLayer();
        this.addLegend();
    }

    removeMap() {
        this.map.remove();
    }

    addTileLayer() {
        // Add title layer to the map
        this.tiles = Leaflet.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    setTileLayer() {
        this.tiles.remove();
        this.addTileLayer();
    }

    // Add all layers to show the upcoming distribution in the map dashboard
    addDistributions(distributions: Array<Distribution>) {
        const country = this.countriesService.selectedCountry;
        const admLayers = LeafletOmnivore.kml('assets/maps/map_' + country.fields.id.value.toLowerCase() + '.kml').on('ready', () => {
            // Center view on country
            this.map.fitBounds(admLayers.getBounds());

            // Remove previous layers on the map
            this.map.eachLayer((layer: Leaflet.Layer) => {
                if (!(layer instanceof Leaflet.TileLayer)) {
                    this.map.removeLayer(layer);
                }
            });

            // Exit if there is nothing to display
            if (!distributions) {
                return;
            }
            // Create empty markers
            const markers = this.initializeFeatureGroup();

            // Find regions corresponding to distribution
            distributions.forEach((distribution: Distribution) => {
                const admGroup = new Leaflet.FeatureGroup();

                admLayers.eachLayer((layer: any) => {
                    // Fill an array containing all the adm of the current layer
                    const kmlAdm = [
                        layer.feature.properties.ADM0_PCODE,
                        layer.feature.properties.ADM1_PCODE,
                        layer.feature.properties.ADM2_PCODE,
                        layer.feature.properties.ADM3_PCODE,
                    ];
                    // Group all the matching adm4 layers
                    if (this.compareAdmToMapDistribution(kmlAdm, distribution.get('location').get<string>('codeForMap'))) {
                        admGroup.addLayer(layer);
                    }
                });
                const distributionMarker = new DistributionMarker(admGroup, this.map, distribution);
                // Add the marker to the cluster
                markers.addLayer(distributionMarker.marker);
            });

            // Add it to the map
            markers.addTo(this.map);
        });
    }

    // Compare the kml layer's location to the distribution's code recursively
    compareAdmToMapDistribution(adm: Array<string>, distribution_adm: string): boolean {
        const admLevel = this.getAdmLevel(distribution_adm);
        // If an adm is missing in the location layer, retry with a broader region
        if (!adm[admLevel]) {
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
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false,
        }).on('clusterclick', function (a: any) {
            a.layer.zoomToBounds({ padding: [20, 20] });
        });
    }

    private addLegend() {
        new Legend(this.distributionMarkerService.generateMarker(false)).legend.addTo(this.map);
    }
}
