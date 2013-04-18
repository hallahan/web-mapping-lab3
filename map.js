window.onload = init;

var map = null
  , geoJson = null;

$.getJSON('wecomatracks.json', function(data) {
  geoJson = data;
  setupTracks(data);
});


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

function setupTracks(geoJson) {
  var trackStyle = {
    "color": "black",
    "weight": 2,
    "opacity": 0.65
  };

  var highlightedStyle = {
    "color": "#FFFF00",
    "weight": 4,
    "opacity": 0.8
  };

  L.geoJson(geoJson, {
    style: trackStyle,
    onEachFeature: function(feature, layer) {
      layer.on({
        // highlight feature
        mouseover: function(e) {
          layer.setStyle(highlightedStyle);
        },
        // reset highlight
        mouseout:  function(e) {
          layer.setStyle(trackStyle);
        }
      });
    }
  }).addTo(map);
}

