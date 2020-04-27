const monthSlider = document.getElementById('month-slider')
const activeMonthLabel = document.getElementById('active-month')
const linksLayerToggle = document.getElementById('links-checkbox')
const rankDisplay = document.getElementById('rank');
const stationIdDisplay = document.getElementById('sid');
const locationDisplay = document.getElementById('loc');
const spinner = document.getElementById('spinner')

const files = {
    stations: './data/stations.csv',
    ranks: './data/ranks.csv',
    links: './data/links.csv'
}

monthLiteral = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

// Stations color palette: min, max, hover
circleColors = ['#FCA107', '#7F3121', '#d0340d']
// Links color palette: none, in, out
linkColors = ['#6aa5fc', '#ff5a5a', '#ffda1f']
// Stations radius domain/range values: min domain, max domain, min range, max range
circleRadius = [[1, 9], [4, 16]]
// Links width domain/range values: min domain, max domain, min range, max range
linkWidths = [[1, 6], [2, 4]]