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

// Add a new layer to visualize the hexbins for CONGESTION (waze jams)
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

    });
