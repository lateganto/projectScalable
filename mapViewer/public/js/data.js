function start(jsonUrl) {
    console.log('start')
    readData(jsonUrl).then(drawData)
        .catch(err =>  {
            spinnerText.textContent = err.toString()
        });
}


async function readData(jsonUrl) {
    spinnerText.textContent = 'Reading files location'
    console.log('Readin')

    const json = await d3.json(jsonUrl);
    console.log(json)

    return Promise.all(
        [d3.csv(json.files.stations, typeStation),
            collectData(json.files.ranks, typeRank),
            collectData(json.files.links, typeLink)]
    ).then(processData)
}

/*readData = d3.json(jsonUrl).then(function (json) {
    spinnerText.textContent = 'Reading files location'

    return Promise.all(
        [d3.csv(json.files.stations, typeStation),
            collectData(json.files.ranks, typeRank),
            collectData(json.files.links, typeLink)]
    ).then(processData)
        .catch(err => {
            throw err
        });

}).catch(err => {
    throw err
});*/

async function collectData(urls, typeData) {
    spinnerText.textContent = 'Collecting files'

    return Promise.all(urls.map(url => d3.csv(url, typeData)))
}

function processData(rawData) {
    spinnerText.textContent = 'Processing data'

    console.log(rawData)
    stations = {};
    rawData[0].forEach(function (station) {
        stations[station.station] = station;
    });

    console.log(stations)

    geoStations = rawData[1].map(ranks => processStations(stations, ranks))
    geoLinks = rawData[2].map(links => processLinks(stations, links))

    console.log(geoStations)
    console.log(geoLinks)
    return {
        'stations': geoStations,
        'links': geoLinks
    }
}

function processStations(stations, ranks) {
    ranks.forEach(function (rStation) {
        rStation.lat = stations[rStation.station].lat
        rStation.lon = stations[rStation.station].lon
        rStation.name = stations[rStation.station].name
    });

    return GeoJSON.parse(ranks, {Point: ['lat', 'lon']});
}

function processLinks(stations, links) {
    links.forEach(function (link) {
        link.source = [stations[link.source_id].lon, stations[link.source_id].lat]
        link.target = [stations[link.target_id].lon, stations[link.target_id].lat]
    });

    return GeoJSON.parse(links, {LineString: ['source', 'target']});
}

function typeStation(s) {
    return {
        station: +s.station,
        lon: +s.lon,
        lat: +s.lat,
        name: s.name
    }
}

function typeRank(r) {
    return {
        station: +r.station,
        rank: +r.rank * rankFactor
    }
}

function typeLink(l) {
    return {
        source_id: +l.source,
        target_id: +l.target,
        weight: +l.weight
    }
}