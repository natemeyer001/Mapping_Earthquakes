// create the tile layer that will be the background of our map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// We create the dark view tile layer that will be an option for our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

let map = L.map('mapid', {
    center: [39.5, -98.5],
    zoom: 3,
    layers: [streets]
});

// Create a base layer that holds both maps.
let baseMaps = {
    "Streets": streets,
    "Satellite": satelliteStreets
  };

// Create the earthquake layer for our map.
let earthquakes = new L.layerGroup();

// We define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
    Earthquakes: earthquakes
  };

L.control.layers(baseMaps, overlays).addTo(map);


// determines the color for each circle marker based on magnitude
function getColor(magnitude) {
    if (magnitude > 5) {
        return "#ea2c2c";  //red
    }
    if (magnitude > 4) {
        return "#ea822c";  //orange
    }
    if (magnitude > 3) {
        return "#ee9c00";  //orange-yellow
    }
    if (magnitude > 2) {
        return "#eecc00";  //yellow
    }
    if (magnitude > 1) {
        return "#d4ee00";  //yellow-green
    }
    return "#98ee00";  //light-green
}

// determines the radius for each earthquake marker 
function getRadius(magnitude){
    if (magnitude === 0) {
        return 1;
    }
    return magnitude*4
}

// returns style data for each earthquake
function styleInfo(feature) {
    return {
        opacity: 1,
        fillOpacity: 1, 
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
    };
}

// Retrieve the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
  // Creating a GeoJSON layer with the retrieved data.
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
        },
        style: styleInfo,
            onEachFeature: function(feature, layer) {
                layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
            }
    }).addTo(earthquakes);

    earthquakes.addTo(map);
});

// Create a legend control object.
let legend = L.control({
    position: "bottomright"
});

// Then add all the details for the legend.
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    const magnitudes = [0, 1, 2, 3, 4, 5];
    const colors = [
        "#98ee00",
        "#d4ee00",
        "#eecc00",
        "#ee9c00",
        "#ea822c",
        "#ea2c2c"
    ];

    for (var i = 0; i < magnitudes.length; i++) {
        console.log(colors[i]);
        div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " + 
            magnitudes[i] + (magnitudes[i+1] ? "&ndash;" + magnitudes[i+1] + "<br>" : "+");
    }
    return div;
};

legend.addTo(map);