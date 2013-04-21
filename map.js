window.onload = init;

// don't use these, they are just for your
// introspective pleasure in the console!
var map = null
  , geoModel = null;


function GeoModel(geoJsonObj) {
  this.data = geoJsonObj;
};

GeoModel.prototype = {

  /*
    @return An array of features that have corresponding
            value for a given property
  */
  queryByProperty: function(propertyType, propertyValue) {
    var data = this.data;
    var results = [];
    if (data && data.features) {
      var features = data.features;
      for (i in features) {
        var feat = features[i];
        if (feat.properties && feat.properties[propertyType]) {
          
          // == makes sense, because we would want type coersion for a query
          if (feat.properties[propertyType] == propertyValue) {
            results.push(feat);
          }
        }
      }
    }
    return results;
  },

  getData: function() {
    return this.data;
  }

};


function init() {
	//creates a new map
	map = new L.Map('map');

  $.getJSON('wecomatracks.json', function(data) {
    geoModel = new GeoModel(data);
    // geoModel.queryByCruiseId('2');

    setupTracks( geoModel.getData() );
  });

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

  $("#menu").menu().on( "menuselect", function(event, ui) {
    var item = $.trim(ui.item.text());
    console.log(item);
  });
}

function setupTracks(geoData) {
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

  L.geoJson(geoData, {
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
        },
        // feature is clicked
        click: function(e) {
          $("#sidebar").append('clicked...<br/>');
        }
      });
    }
  }).addTo(map);
}

