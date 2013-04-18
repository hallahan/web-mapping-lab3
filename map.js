window.onload = init;

var map;
// a global variable

function init() {

	//creates a new map
	map = new L.Map('map');

	//creates an ocean floor background layer
	var esriOceanFloorURL = 'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}';
	var oceanFloorLayer = new L.TileLayer(esriOceanFloorURL, {
		maxZoom : 19,
		attribution : 'Tiles: &copy; Esri'
	});

	//centers map and default zoom level
	map.setView([46.8, -124.030151], 7);

	//adds the background layer to the map
	map.addLayer(oceanFloorLayer);
	
}

