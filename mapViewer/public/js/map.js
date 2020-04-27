function drawData(data) {
    map = getMap()
    layers = ['links', 'stations']

    loadMapLayers(map, layers, data)
    setMapInteraction(layers)

    setToggleableLayer(map, layers[0])
    setMonthSlider(map, layers)

    spinner.remove()
}

function getMap() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2Fsdm92IiwiYSI6ImNrOTlyYWs4aDA2czMzbXJ3NzVveWI4dmEifQ.v51k6bgzhO1LBwuO9jZKEg';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/salvov/ck9ftkh9p3sra1ilg1ddppb7g',
        //style: 'mapbox://styles/mapbox/light-v10',
        center: [-77.0369, 38.9072],    // starting position [lon, lat]
        zoom: 11.5                       // starting zoom
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    return map
}

function loadMapLayers(map, layerIDs, data) {
    linksLayerId = layerIDs[0]
    stationsLayerId = layerIDs[1]

    map.on('load', function() {
        map.addSource(linksLayerId, {
            type: 'geojson',
            data: data.links
        });

        map.addSource(stationsLayerId, {
            type: 'geojson',
            data: data.stations,
            generateId: true     // This ensures that all features have unique IDs
        });

        map.addLayer({
            id: linksLayerId,
            type: 'line',
            source: linksLayerId,
            layout: {
                'visibility': 'none',
                'line-cap': 'round',
                'line-join': 'round'
            },
            paint: {
                'line-width':
                    ['interpolate', ['linear'],
                        ['get', 'weight'],
                        linkWidths[0][0], linkWidths[1][0],
                        linkWidths[0][1], linkWidths[1][1]
                    ],
                'line-color': linkColors[0],
                'line-opacity': 0.75
            },
            filter: ['==', ['number', ['get', 'month']], 1]
        });

        map.addLayer({
            id: stationsLayerId,
            type: 'circle',
            source: stationsLayerId,
            layout: {
                'visibility': 'visible'
            },
            paint: {
                'circle-color':
                    ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        circleColors[2],
                        ['interpolate', ['linear'],
                            ['get', 'rank'],
                            circleRadius[0][0], circleColors[0],
                            circleRadius[0][1], circleColors[1]
                        ]
                    ],
                'circle-radius':
                    ['case',
                        ['boolean', ['feature-state', 'hover'], false],
                        circleRadius[1][1] + 0.5,
                        ['interpolate', ['linear'],
                            ['get', 'rank'],
                            circleRadius[0][0], circleRadius[1][0],
                            circleRadius[0][1], circleRadius[1][1]
                        ]
                    ],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': 0.95
            },
            filter: ['==', ['number', ['get', 'month']], 1]
        });

    });
}

function setMapInteraction(layers) {
    stationId = null;
    inLinksLayer = null;
    outLinksLayer = null;

    map.on('mouseenter', layers[1], function(e) {
        map.getCanvas().style.cursor = 'pointer';

        stationIdDisplay.textContent = e.features[0].properties.station;
        locationDisplay.textContent = e.features[0].properties.name;
        rankDisplay.textContent = e.features[0].properties.rank;

        if (stationId !== null) {
            map.removeFeatureState({
                source: layers[1],
                id: stationId
            });
        }

        stationId = e.features[0].id;

        map.setFeatureState({
            source: layers[1],
            id: stationId,
        }, { hover: true });

        monthFilter = ['==', ['number', ['get', 'month']], e.features[0].properties.month]
        outFilter = ['==', ['number',['get', 'source_id']], e.features[0].properties.station]
        inFilter = ['==', ['number',['get', 'target_id']], e.features[0].properties.station]

        outLinksLayer =
            addStationLinksLayer(map, layers, 'outStLinks', [outFilter, monthFilter], linkColors[2])
        inLinksLayer =
            addStationLinksLayer(map, layers, 'inStLinks', [inFilter, monthFilter], linkColors[1])
    });

    map.on('mouseleave', layers[1], function() {
        map.getCanvas().style.cursor = '';

        if (stationId !== null) {
            map.setFeatureState({
                source: layers[1],
                id: stationId
            }, {
                hover: false
            });
        }

        stationId = null;
        if (inLinksLayer) {
            map.removeLayer(inLinksLayer)
        }
        if (outLinksLayer) {
            map.removeLayer(outLinksLayer)
        }

        inLinksLayer = null;
        outLinksLayer = null;

        stationIdDisplay.textContent = '';
        locationDisplay.textContent = '';
        rankDisplay.textContent = '';
    });

    // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
    map.on('click', layers[1], function(e) {
        map.flyTo({ center: e.features[0].geometry.coordinates });
    });
}

function addStationLinksLayer(map, baseLayers, layerId, filters, color) {
    map.addLayer({
        id: layerId,
        type: 'line',
        source: baseLayers[0],
        layout: {
            'line-cap': 'round',
            'line-join': 'round'
        },
        paint: {
            'line-width': ['interpolate', ['linear'],
                ['get', 'weight'],
                linkWidths[0][0], linkWidths[1][0],
                linkWidths[0][1], linkWidths[1][1]
            ],
            'line-color': color,
            'line-opacity': 0.75
        },
        filter: ['all', filters[0], filters[1]]
    }, baseLayers[1]);

    return layerId
}

function setToggleableLayer(map, layerId) {
    linksLayerToggle.addEventListener('input', function (e) {
        visibility = map.getLayoutProperty(layerId, 'visibility');

        // toggle layer visibility by changing the layout object's visibility property
        if (visibility === 'visible') {
            map.setLayoutProperty(layerId, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
    });
}

function setMonthSlider(map, layers) {
    monthSlider.addEventListener('input', function (e) {
        month = parseInt(e.target.value) + 1;
        monthName = monthLiteral[month - 1]

        map.setFilter(layers[1], ['==', ['number', ['get', 'month']], month]);
        map.setFilter(layers[0], ['==', ['number', ['get', 'month']], month]);

        activeMonthLabel.innerText = monthName;
    });
}