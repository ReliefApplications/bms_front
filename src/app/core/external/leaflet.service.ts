import { Injectable } from '@angular/core';
//Plugins
import * as Leaflet from 'leaflet';

import * as $ from 'jquery';

@Injectable({
	providedIn: 'root'
})

export class LeafletService {

	private map: any;
	private tiles: any;

	constructor() {}

	//------------------------------------------------------------------------//
	//---------------------------------- MAP ---------------------------------//
	//------------------------------------------------------------------------//

	createMap(mapId: string) {

		// Create map
		this.map = Leaflet.map(mapId, {
			center: [11.5792295,104.6099912],   // Centered on Phnom Penh
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
}
