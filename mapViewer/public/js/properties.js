const monthSlider = document.getElementById('month-slider')
const activeMonthLabel = document.getElementById('active-month')
const linksLayerToggle = document.getElementById('links-checkbox')
const rankDisplay = document.getElementById('rank');
const stationIdDisplay = document.getElementById('sid');
const locationDisplay = document.getElementById('loc');
const spinnerBackground = document.getElementById('spinner-background')
const spinnerText = document.getElementById('spinner-text')
const spinner = document.getElementById('spinner')

const jsonUrl = "./data/result.json"

const monthLiteral = [
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
const circleColors = ['#FCA107', '#7F3121', '#d0340d']
// Links color palette: none, in, out
const linkColors = ['#6aa5fc', '#ff5a5a', '#ffda1f']
// Stations radius domain/range values: min domain, max domain, min range, max range
const circleRadius = [[0.1, 1], [3, 15]]
const rankFactor = 100
// Links width domain/range values: min domain, max domain, min range, max range
const linkWidths = [[0.1, 1], [1, 5]]