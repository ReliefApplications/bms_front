import { Injectable } from '@angular/core';
import * as LeafletOmnivore from '@mapbox/leaflet-omnivore';
// Plugins
import * as Leaflet from 'leaflet';
import { LocationService } from '../api/location.service';
import { CountriesService } from '../countries/countries.service';
import { AsyncacheService } from '../storage/asyncache.service';
import { MapCodeDistribution } from './map-distribution';


@Injectable({
    providedIn: 'root'
})

export class LeafletService {

    public loading = false;
    private map: any;
    private tiles: any;

    constructor(
        private _locationService: LocationService,
        private _cacheService: AsyncacheService,
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
        const admLayers = LeafletOmnivore.kml('assets/maps/map_' + country.fields.id.value.toLowerCase() + '.kml').on('ready', () => {
            // Center view on country
            this.map.fitBounds(admLayers.getBounds());

            // Get all upcoming distributions
            this._locationService.getUpcomingDistributionCode().subscribe((mapDistributions: Array<MapCodeDistribution>) => {
                const admGroup = new Leaflet.FeatureGroup();
                mapDistributions.forEach((mapDistribution: MapCodeDistribution) => {
                admLayers.eachLayer((layer: any) => {
                    const adm = [
                        layer.feature.properties.ADM0_PCODE,
                        layer.feature.properties.ADM1_PCODE,
                        layer.feature.properties.ADM2_PCODE,
                        layer.feature.properties.ADM3_PCODE,
                    ];
                    if (this.compareAdmToMapDistribution(adm, mapDistribution)) {
                        admGroup.addLayer(layer);
                    }
                });
            });
            const circle = Leaflet.circle(
                admGroup.getBounds().getCenter(),
                {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: 500,
                }
            ).addTo(this.map)

            // admGroup.setStyle({
            //     color: '#4AA896', // $bms_green
            //     fillColor: '#4AA896', // $bms_green
            //     weight: 2,
            //     fillOpacity: .8,
            //     opacity: .8
            // }).addTo(this.map);
        });



    })

        //     current_country => {
        //         const country = current_country ? current_country : 'KHM';
        //         this.loading = true;
        //         // Check if the map is already created
        //         if (this.map) {
        //             this._locationService.getUpcomingDistributionCode().subscribe
        //         }
                        // (apiDistributions: Array<any>) => {
                        //     const upcomingDistributions = apiDistributions.map(
                        //         (apiDistribution: any) => Distribution.apiToModel(apiDistribution)
                        //         );
                        //     // call the KML file to get the layer
                        //     const admLayers = LeafletOmnivore.kml('assets/maps/map_' + country.toLowerCase() + '.kml').on('ready', () => {
                        //         // center the map on the appropriate country
                        //         const admGroup = Leaflet.featureGroup(admLayers.getLayers());
                        //         this.map.fitBounds(admGroup.getBounds());

                        //         // delete the displaying layer
                        //         admLayers.eachLayer((adm: any) => {
                        //             adm.setStyle({
                        //                 opacity: 0,
                        //                 weight: 0,
                        //                 fillOpacity: 0
                        //             });
                        //         });

                                // search in all layer which layer has a code begining with the location code of a upcoming distribution
                                // and set a color and a weigth of them
                                // admLayers.eachLayer((adm, index) => {
                                //     console.log(adm)
                                    // if (upcomingDistributions) {
                                    //     upcomingDistributions.forEach((upcomingDistribution: Distribution) => {

                                    //         // // console.log(adm, upcomingDistribution)

                                    //         // /**
                                    //         //  * @TODO Change this !!! This is a temporary fix in order for the map to work.
                                    //         //  * The link between the adm1 in database and the adm1 in `map_khm.kml` should totally
                                    //         //  * be remade.
                                    //         //  */
                                    //         // // let code = upcomingDistribution.get('location').get<string>('code');
                                    //         // // code = code.length % 2 === 1 &&
                                    //         // //                         code[2] === '0'
                                    //         // //                         ? code.slice(0, 2) + code.slice(3)
                                    //         // //                         : code;

                                    //         // // if ((adm.feature.properties.ADM3_PCODE === code.slice(0, 8)
                                    //         // //       && upcomingDistribution.adm_level === 'adm4') ||
                                    //         // //     (adm.feature.properties.ADM3_PCODE === code
                                    //         // //       && upcomingDistribution.adm_level === 'adm3') ||
                                    //         // //     (adm.feature.properties.ADM2_PCODE === code
                                    //         // //       && upcomingDistribution.adm_level === 'adm2') ||
                                    //         // //     (adm.feature.properties.ADM1_PCODE === code
                                    //         // //       && upcomingDistribution.adm_level === 'adm1')) {

                                    //         // //     adm.setStyle({
                                    //         // //         color: '#4AA896', // $bms_green
                                    //         // //         fillColor: '#4AA896', // $bms_green
                                    //         // //         weight: 2,
                                    //         // //         fillOpacity: .8,
                                    //         // //         opacity: .8
                                    //         // //     });

                                    //         // //     let tooltipInformation = '';
                                    //         // //     upcomingDistribution.distribution.forEach(function (data, i, el) {
                                    //         // //         tooltipInformation += '<p> Distribution : ' + data.name + '</p>';
                                    //         // //         tooltipInformation += '<p> Location : ' + data.location_name + '</p>';

                                    //         // //         // to display a divider between distribution in a same tooltip
                                    //         // //         // but don't put divider after thie last element
                                    //         // //         if (!Object.is(el.length - 1, i)) {
                                    //         // //             tooltipInformation += '<hr>';
                                    //         // //         }

                                    //         // //     });

                                    //         // //     const tooltip = Leaflet.tooltip({
                                    //         // //         permanent: false,
                                    //         // //         interactive: true
                                    //         // //     }, adm).setContent(tooltipInformation);
                                    //         // //     adm.bindTooltip(tooltip);
                                    //         // // }
                                    //     });
                                    // }
        //                         });
        //                         this.loading = false;
        //                     });
        //                     admLayers.addTo(this.map);
        //                 }
        //             );

        //         }
        //     }
        // );
    }

    compareAdmToMapDistribution(adm: Array<string>, mapDistribution: MapCodeDistribution): boolean {
        const admLevel = parseInt(mapDistribution.adm_level.split('adm')[1], 10);
        return adm[admLevel] === mapDistribution.code_location;
    }

}
