mapboxgl.accessToken = 'pk.eyJ1IjoiamVubmFlcHN0ZWluIiwiYSI6ImNsNGVnNDYzeTAzNngzaHBnNzRudzc4cTMifQ.2wp3VwYUh4zu52vpG-eiNg'; // custom token
// Set bounds to DC area - http://bboxfinder.com/ is useful for this
const bounds = [
  [-77.317039, 38.796908],
  [-76.795532, 38.974357]
];

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jennaepstein/cl3nk19p3001m15uz51hk6k3e', // custom style
  center: [-77.03422758, 38.9067983],
  zoom: 13,
  maxBounds: bounds // Set the map's geographical boundaries.
});


// Adding geocoding - NEED TO REPLACE WITH A KEY, ETC THAT ALLOWS FOR MORE CALLS, IF POSSIBLE.
map.addControl(
  // eslint-disable-next-line no-undef
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    // Use a bounding box to limit results to El Paso general area
    bbox:     [-77.317039, 38.796908, -76.795532, 38.974357],
    mapboxgl
  })
);

// Add mapbox navigational control, default top right
map.addControl(new mapboxgl.NavigationControl());

// Wait until the map has finished loading.


// ADD ISOCHRONES STUFF
const isoAppData = {
  params: {
    urlBase: "https://api.mapbox.com/isochrone/v1/mapbox/",
    profile: "walking/",
    minutes: 10
  },
  origins: {
    a: [-77.03422758, 38.9067983]
  },
  isos: {
    a: {}
  }
};

// Grab the elements from the DOM to assign interactivity
const params = document.getElementById("params");
const msg = document.getElementById("msg");

// Get a single isochrone for a given position and return the GeoJSON
const getIso = function(position) {
  // Build the URL for the isochrone API
  const isoUrl = isoAppData.params.urlBase + isoAppData.params.profile + position.join(",") + "?contours_minutes=" +
  isoAppData.params.minutes + "&polygons=true&access_token=" + mapboxgl.accessToken;

  // Return the GeoJSON
  return fetch(isoUrl).then(res => res.json());
};

// Update the map sources so the isochrones draw on the map
const setIsos = function(isos) {
  // Save the isochrone data into the app object
  isoAppData.isos.a = isos[0];

  // Update the map
  map.getSource("isoA").setData(isoAppData.isos.a);
};

// Get the isochrone data from the API, then update the map
const getIsos = function() {
  const isochroneA = getIso(isoAppData.origins.a);

  // Once the isochrones are received, update the map
  Promise.all([isochroneA]).then(values => {
    setIsos(values);
  });
};

// ADD DATA LAYERS
  map.on('load', () => {
      // Add data layer for food and drink
      map.addLayer({
          'id': 'Food/Drink',
          'type': 'circle',
          'filter': ['==', 'category', 'Food/Drink'],
          'source': {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/jennaepstein/AandJwedding_DCmap/main/DC_spots.geojson'
          },
          'layout': {
          // Make the layer visible by default.
            'visibility': 'visible'
          },
          'paint': {
            'circle-radius': 8,
            'circle-color': '#843c47'
          }
      });
      // Add data layer for museums
      map.addLayer({
          'id': 'Museums',
          'type': 'circle',
          'filter': ['==', 'category', 'Museum'],
          'source': {
            type: 'geojson',
            data: 'https://raw.githubusercontent.com/jennaepstein/AandJwedding_DCmap/main/DC_spots.geojson'
          },
          'layout': {
          // Make the layer visible by default.
            'visibility': 'visible'
          },
          'paint': {
            'circle-radius': 8,
            'circle-color': '#DC872C'
          }
      });

    // After the last frame rendered before the map enters an "idle" state.
    map.on('idle', () => {
        // If these two layers were not added to the map, abort
        if (!map.getLayer('Food/Drink') || !map.getLayer('Museums')) {
            return;
        }

        // Enumerate ids of the layers.
        const toggleableLayerIds = ['Food/Drink', 'Museums'];
      });

 
  // Popups for Food/Drink
  map.on('click', 'Food/Drink', (e) => {
    new mapboxgl.Popup()
      .setMaxWidth("400px")
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${e.features[0].properties.title}</strong><br>${e.features[0].properties.address}<br><em>${e.features[0].properties.description}</em>`)
      .addTo(map);
  });

  map.on('mouseenter', 'Food/Drink', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'Food/Drink', () => {
    map.getCanvas().style.cursor = '';
  });

  // Popups for Museums
  map.on('click', 'Museums', (e) => {
    new mapboxgl.Popup()
      .setMaxWidth("400px")
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${e.features[0].properties.title}</strong><br>${e.features[0].properties.address}<br><em>${e.features[0].properties.description}</em>`)
      .addTo(map);
  });

  map.on('mouseenter', 'Museums', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'Museums', () => {
    map.getCanvas().style.cursor = '';
  });


  // Add sources and layers for the isochrones
  map.addSource("isoA", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
      ]
    }
  });

  map.addLayer({
    "id": "isoLayerA",
    "type": "fill",
    "source": "isoA",
    "layout": {},
    "paint": {
      "fill-color": "gold",
      "fill-opacity": 0.3
    }
  }, "poi-label");

  // Once the map is all set up, load some isochrones
  getIsos();
});

// Set up the origin markers and their interactivity
const originA = new mapboxgl.Marker({
  draggable: true,
  color: "#d4af37",
  scale: 0.75
  
})
  .setLngLat(isoAppData.origins.a)
  .addTo(map);

// When the point is moved, refresh the isochrones
function onDragEndA() {
  const lngLat = originA.getLngLat();
  isoAppData.origins.a = [lngLat.lng, lngLat.lat];
  getIsos();
}

originA.on("dragend", onDragEndA);

params.addEventListener("change", e => {
  if (e.target.name === "profile") {
    isoAppData.params.profile = e.target.value;
    getIsos();
  } else if (e.target.name === "duration") {
    isoAppData.params.minutes = e.target.value;
    getIsos();
  } else if (e.target.name === "category") {
    isoAppData.params.category = e.target.value;
    getIsos();
  }
});

    