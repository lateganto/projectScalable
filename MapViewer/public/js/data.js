function readData(files) {
    typeFiles = [
        [files.stations, typeStation],
        [files.ranks, typeRank],
        [files.links, typeLink]
    ]

    return Promise.all(typeFiles.map(url => d3.csv(url[0], url[1])))
        .then(processData);
}

function processData(rawData) {
    stations = {};
    rawData[0].forEach(function (station) {
        stations[station.station] = station;
    });

    ranks = rawData[1]
    links = rawData[2]

    geoStations = processStations(stations, ranks)
    geoLinks = processLinks(stations, links)

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
        rank: +r.rank,
        month: +r.month
    }
}

function typeLink(l) {
    return {
        source_id: +l.source,
        target_id: +l.target,
        weight: +l.weight,
        month: +l.month
    }
}