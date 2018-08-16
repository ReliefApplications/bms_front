import { Injectable } from '@angular/core';
//Plugins
import * as Leaflet from 'leaflet';
import * as LeafletOmnivore from '@mapbox/leaflet-omnivore';

import * as $ from 'jquery';
import { LocationService } from '../api/location.service';
import { CacheService } from '../storage/cache.service';
import { HttpService } from '../api/http.service';
import { addToViewTree } from '@angular/core/src/render3/instructions';

@Injectable({
	providedIn: 'root'
})

export class LeafletService {

	private map: any;
	private tiles: any;
	// private runLayer;
	private upcomingDistribution = [];

	constructor(
		private _locationService: LocationService,
		private _cacheService: CacheService,
		private http: HttpService

	) { }

	//------------------------------------------------------------------------//
	//---------------------------------- MAP ---------------------------------//
	//------------------------------------------------------------------------//

	createMap(mapId: string) {

		// Create map
		this.map = Leaflet.map(mapId, {
			center: [11.5792295, 104.6099912],   // Centered on Phnom Penh
			zoom: 7,
			maxZoom: 10,
			minZoom: 3,           // Too see the whole world on small screens
			zoomControl: true,        // Display the + and - buttons for the zoom
			zoomAnimation: true,        // Smooth transition of zoom
			trackResize: true,        // Keep the center of the map if the window is resized
			doubleClickZoom: true,        // To zoom on the pointer position and not on the center of the map
			dragging: true,         // Enable the dragging of the map
			scrollWheelZoom: false,
			layers: []
		});

		this.map.once('focus', () => { this.map.scrollWheelZoom.enable(); });
		this.getUpcomingDistributionCode();

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

		
		//Check if the map is already created
		if (this.map) {

			//get in the cache the liste of upcoming distribution
			let upcomingDistribution = this._cacheService.get(CacheService.MAPSDATA);

			// //call the KML file to get the layer
			let admLayer = LeafletOmnivore.kml('assets/maps/map.kml').on("ready", function () {

				//delete the displaying layer
				admLayer.eachLayer(function (adm) {
					adm.setStyle({
						opacity: 0,
						weight: 0,
						fillOpacity: 0
					});
				});

				//search in all layer which layer has a code begining with the location code of a upcoming distribution & if the code is a adm3 code and set a color and a weigth of them
				admLayer.eachLayer(function (adm) {
					upcomingDistribution.forEach(element => {
						if ((adm.feature.properties.ADM3_PCODE === element.code_location && element.adm_level === "adm3") || 
							(adm.feature.properties.ADM2_PCODE === element.code_location && element.adm_level === "adm2") || 
							(adm.feature.properties.ADM1_PCODE === element.code_location && element.adm_level === "adm1") ) {

							adm.setStyle({
								color : '#E75B48',
								fillColor: '#E75B48',
								weight: 2,
								fillOpacity : .5,
								opacity: .2
							});

							//Create tooltip which is display when there is a hover event
							let tooltipInformation = 	"<p> Distribution : " + element.name + "</p>" + 
														"<p> Location : " + element.location_name + "</p>" ;
							let tooltip = Leaflet.tooltip({
								permanent : false,
								interactive : true
							}, adm).setContent(tooltipInformation);
							adm.bindTooltip(tooltip);
						}
					});
				})
			})

			
			admLayer.addTo(this.map);
		}
	}



	//get all upcoming distribution and set it in the cache 
	getUpcomingDistributionCode() {
		let promise = this._locationService.getUpcomingDistributionCode();
		if (promise) {
			promise.toPromise().then(response => {
				this._cacheService.set(CacheService.MAPSDATA, response.json());
			})
		}

	}








}
