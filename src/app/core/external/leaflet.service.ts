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
		this.addKML();
		this.getUpcomingDistributionCode();
		console.log(this._cacheService.get(CacheService.MAPSDATA));

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

	addCities() {
	}

	addKML() {

		if (this.map) {
			// this.runLayer = LeafletOmnivore.kml('assets/maps/map.kml').addTo(this.map);

			// this.runLayer = LeafletOmnivore.geojson('assets/maps/map.json').addTo(this.map);

			
			let runLayer = LeafletOmnivore.geojson('assets/maps/map.json').on("ready", function() {
				runLayer.eachLayer(function(layer) {
					if (layer.feature.properties.Name == "KH070302") {
						console.log("KH070302", layer);
					}
				})
			}).addTo(this.map);

			// console.log(this.runLayer);

			console.log(this.map)
			this.map.eachLayer(function(layer) {
				console.log("layer", layer);
			})


		}

	}

	getUpcomingDistributionCode() {
		let promise = this._locationService.getUpcomingDistributionCode();
		if (promise) {
			promise.toPromise().then(response => {
				this._cacheService.set(CacheService.MAPSDATA, response.json());
			})
		}
	}

	






}
