import { Injectable } from '@angular/core';
//Plugins
import * as Leaflet from 'leaflet';
import * as LeafletOmnivore from '@mapbox/leaflet-omnivore';

import * as $ from 'jquery';
import { LocationService } from '../api/location.service';
import { AsyncacheService } from '../storage/asyncache.service';

@Injectable({
    providedIn: 'root'
})

export class LeafletService {

    private map: any;
    private tiles: any;
    public static loading : boolean = false;

    constructor(
        private _locationService: LocationService,
        private _cacheService: AsyncacheService,
    ) { }

    //------------------------------------------------------------------------//
    //---------------------------------- MAP ---------------------------------//
    //------------------------------------------------------------------------//

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
    }

    addTileLayer() {
        // Add title layer to the map
        this.tiles = Leaflet.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: "reliefapps/cjgwb2m24003t2slbqoxip7jr",
            accessToken: 'pk.eyJ1IjoicmVsaWVmYXBwcyIsImEiOiJjaXhoY2RicGMwMDBuMnltb3Jjc2k4dm5mIn0.V6kvZDXX_gxk-f8f9Ldr8w'
        }).addTo(this.map);
    }

    setTileLayer() {
        this.tiles.remove();
        this.addTileLayer();
    }

    //add all layers to show the upcoming distribution in the map dashoard
    addKML() {
        this._cacheService.get(AsyncacheService.COUNTRY).subscribe(
            result => {
                let country = result ? result : "KHM";
                LeafletService.loading = true;
                //Check if the map is already created
                if (this.map) {

                    //get in the cache the list of upcoming distribution
                    let upcomingDistribution;

                    this._locationService.getUpcomingDistributionCode().subscribe(
                        result => {
                            upcomingDistribution = result;
                            // call the KML file to get the layer
                            let admLayers = LeafletOmnivore.kml('assets/maps/map_' + country.toLowerCase() + '.kml').on("ready", () => {
                                // center the map on the appropriate country
                                let admGroup = Leaflet.featureGroup(admLayers.getLayers());
                                this.map.fitBounds(admGroup.getBounds());

                                //delete the displaying layer
                                admLayers.eachLayer(adm => {
                                    adm.setStyle({
                                        opacity: 0,
                                        weight: 0,
                                        fillOpacity: 0
                                    });
                                });

                                //search in all layer which layer has a code begining with the location code of a upcoming distribution and set a color and a weigth of them
                                admLayers.eachLayer(function (adm, index) {
                                    if (upcomingDistribution) {
                                        upcomingDistribution.forEach(element => {
                                            if ((adm.feature.properties.ADM4_PCODE === element.code_location && element.adm_level === "adm4") ||
                                                (adm.feature.properties.ADM3_PCODE === element.code_location && element.adm_level === "adm3") ||
                                                (adm.feature.properties.ADM2_PCODE === element.code_location && element.adm_level === "adm2") ||
                                                (adm.feature.properties.ADM1_PCODE === element.code_location && element.adm_level === "adm1")) {

                                                adm.setStyle({
                                                    color: '#4AA896', // $bms_green    
                                                    fillColor: '#4AA896', // $bms_green
                                                    weight: 2,
                                                    fillOpacity: .8,
                                                    opacity: .8
                                                });

                                                let tooltipInformation = '';
                                                element.distribution.forEach(function (data, index, element) {
                                                    tooltipInformation += "<p> Distribution : " + data.name + "</p>";
                                                    tooltipInformation += "<p> Location : " + data.location_name + "</p>"

                                                    //to display a divider between distribution in a same tooltip
                                                    //but don't put divider after thie last element
                                                    if (!Object.is(element.length - 1, index)) {
                                                        tooltipInformation += "<hr>";
                                                    }

                                                })

                                                let tooltip = Leaflet.tooltip({
                                                    permanent: false,
                                                    interactive: true
                                                }, adm).setContent(tooltipInformation);
                                                adm.bindTooltip(tooltip);
                                            }
                                        });
                                    }
                                });
                                LeafletService.loading = false;
                            })
                            admLayers.addTo(this.map);
                        },
                        error => { 
                            console.log('Here is the error')
                            console.log(error) 
                        }
                    )

                }
            }
        );
    }
}
