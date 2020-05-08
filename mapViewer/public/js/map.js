function drawData(data) {
    spinnerText.textContent = drawMapDataMessage;

    const map = getMap();
    const layers = mapLayers;

    loadMapLayers(map, layers, data);
    setMapInteraction(layers);

    setToggleableLayer(map, layers[0]);
    setMonthSlider(map, layers, data);

    spinnerBackground.remove();
}

function getMap() {
    mapboxgl.accessToken = mapToken;
    map = new mapboxgl.Map({
        container: 'map',
        style: mapStyle,
        center: mapCenter,
        zoom: mapZoom
    });

    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    return map
}

function loadMapLayers(map, layerIDs, data) {
    var linksLayerId = layerIDs[0];
    var stationsLayerId = layerIDs[1];

    map.on('load', function () {
        map.addSource(
            linksLayerId, {
                type: 'geojson',
                data: data.links[0]
            });

        map.addSource(
            stationsLayerId, {
                type: 'geojson',
                data: data.stations[0],
                generateId: true
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
                'line-opacity': linkOpacity
            }
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
                'circle-stroke-color': circleStrokeColor,
                'circle-stroke-width': circleStrokeWidth,
                'circle-opacity': circleOpacity
            }
        });

    });
}

function setMapInteraction(layers) {
    var stationId = null;
    var inLinksLayer = null;
    var outLinksLayer = null;

    map.on('mouseenter', layers[1], function (e) {
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
        }, {hover: true});

        var outFilter = ['==', ['number', ['get', 'source_id']], e.features[0].properties.station];
        var inFilter = ['==', ['number', ['get', 'target_id']], e.features[0].properties.station];

        outLinksLayer = addStationLinksLayer(map, layers, 'outStLinks', outFilter, linkColors[2]);
        inLinksLayer = addStationLinksLayer(map, layers, 'inStLinks', inFilter, linkColors[1]);
    });

    map.on('mouseleave', layers[1], function () {
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
            map.removeLayer(inLinksLayer);
        }
        if (outLinksLayer) {
            map.removeLayer(outLinksLayer);
        }

        inLinksLayer = null;
        outLinksLayer = null;

        stationIdDisplay.textContent = '';
        locationDisplay.textContent = '';
        rankDisplay.textContent = '';
    });

    // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
    map.on('click', layers[1], function (e) {
        map.flyTo({center: e.features[0].geometry.coordinates});
    });
}

function addStationLinksLayer(map, baseLayers, layerId, filter, color) {
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
            'line-opacity': linkOpacity
        }, filter: filter
    }, baseLayers[1]);

    return layerId
}

function setToggleableLayer(map, layerId) {
    linksLayerToggle.addEventListener('input', function (e) {
        var visibility = map.getLayoutProperty(layerId, 'visibility');

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

function setMonthSlider(map, layers, data) {
    monthSlider.addEventListener('input', function (e) {
        var month = parseInt(e.target.value);
        var monthName = monthLiteral[month];

        map.getSource(layers[0]).setData(data.links[month]);
        map.getSource(layers[1]).setData(data.stations[month]);

        activeMonthLabel.innerText = monthName;
    });
}