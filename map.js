window.onload = init;


var map = null
  , geoModel = null
  , selectedLayer = null
  , showAllControl = null;


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
          // participants are a list
          if (propertyType === 'participants') {
            var participants = feat.properties[propertyType];
            for (var i in participants) {
              var part = participants[i];
              if (part == propertyValue) {
                results.push(feat);
                break;
              }
            }
          }
          // == makes sense, because we would want type coersion for a query
          else if (feat.properties[propertyType] == propertyValue) {
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
    var classList = ui.item.context.classList
    var queriedFeatures = null;

    if (classList.contains('menu-item-participant')) {
      queriedFeatures = geoModel.queryByProperty('participants', item);
      console.log(queriedFeatures);
    } else if (classList.contains('menu-item-departure')) {
      queriedFeatures = geoModel.queryByProperty('departport', item);
      console.log(queriedFeatures);
    } else if (classList.contains('menu-item-arrival')) {
      queriedFeatures = geoModel.queryByProperty('arriveport', item);
      console.log(queriedFeatures);
    } else if (classList.contains('menu-item-cruise-id')) {
      queriedFeatures = geoModel.queryByProperty('cruiseid', item);
      console.log(queriedFeatures);
    }

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

  var originalLayer = L.geoJson(geoData, {
    style: trackStyle,
    onEachFeature: function(feature, layer) {
      layer.on({
        // highlight feature
        mouseover: function(e) {
          layer.setStyle(highlightedStyle);
          displayFeatureProperties(layer.feature);
        },
        // reset highlight
        mouseout:  function(e) {
          layer.setStyle(trackStyle);
          if (!selectedLayer)
            displayFeatureProperties(); //displays nothing  
        },
        // feature is clicked
        click: function(e) {
          originalLayer.clearLayers();
          selectedLayer = layer;
          layer.addTo(map);
          showAllControl = new ShowAllControl();
          map.addControl(showAllControl);
          displayFeatureProperties(layer.feature);
          map.fitBounds(layer.getBounds());
        }
      });
    }
  }).addTo(map);
}


var ShowAllControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        // create the control container with a particular class name
        var container = L.DomUtil.create('button', 'btn');

        // ... initialize other DOM elements, add listeners, etc.
        container.innerHTML = "Show All"
        $(container).click(function(e) {
          // NH TODO: Do this without global var
          if (selectedLayer) {
            map.removeLayer(selectedLayer);
            selectedLayer = null;
          }
          setupTracks(geoModel.getData());
          map.removeControl(showAllControl);
          displayFeatureProperties();
        });
        return container;
    }
});


function displayFeatureProperties(feature) {
  $('#cruise-id').html('&nbsp;');
  $('#start-date').html('&nbsp;');
  $('#end-date').html('&nbsp;');
  $('#depart-port').html('&nbsp;');
  $('#arrive-port').html('&nbsp;');
  $('#participants').html('');

  if (!feature) return;
  var prop = feature.properties;
  if (!prop) return;

  if (prop.cruiseid) $('#cruise-id').html(prop.cruiseid);
  if (prop.startdate) $('#start-date').html(prop.startdate);
  if (prop.enddate) $('#end-date').html(prop.enddate);
  if (prop.departport) $('#depart-port').html(prop.departport);
  if (prop.arriveport) $('#arrive-port').html(prop.arriveport);
  participants = prop.participants;
  if (participants) {
    for (var i in participants) {
      var part = participants[i];
      $('#participants').append(part + '<br/>');
    }
  }
}
