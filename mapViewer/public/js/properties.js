const monthSlider = document.getElementById('month-slider');
const activeMonthLabel = document.getElementById('active-month');
const linksLayerToggle = document.getElementById('links-checkbox');
const rankDisplay = document.getElementById('rank');
const stationIdDisplay = document.getElementById('sid');
const locationDisplay = document.getElementById('loc');
const spinnerBackground = document.getElementById('spinner-background');
const spinnerText = document.getElementById('spinner-text');
const spinner = document.getElementById('spinner');
const gcpButton = document.getElementById('gcp-button');
const demoButton = document.getElementById('demo-button');
const inColorLegend = document.getElementById('in-color');
const outColorLegend = document.getElementById('out-color');

const demo = "./data/result-demo.json";
const gcp = "./data/result.json";

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
];

// map properties
const mapToken = 'pk.eyJ1Ijoic2Fsdm92IiwiYSI6ImNrOTlyYWs4aDA2czMzbXJ3NzVveWI4dmEifQ.v51k6bgzhO1LBwuO9jZKEg';
//const mapStyle = 'mapbox://styles/mapbox/light-v10';
const mapStyle = 'mapbox://styles/salvov/ck9ftkh9p3sra1ilg1ddppb7g';
const mapCenter = [-77.05, 38.90];
var mapZoom = 11.5;
const mapLayers = ['links', 'stations'];

// Stations color palette: min, max, hover
const circleColors = ['#A4DCEC', '#000031', '#002d50'];
const circleOpacity = 0.95;
const circleStrokeColor = '#10212D';
const circleStrokeWidth = 0.7;

// Links color palette: none, in, out
const linkColors = ['#D4D6D7', '#dc3535', '#ffd90e'];
const linkOpacity =  0.85;
inColorLegend.style.background = linkColors[1];
outColorLegend.style.background = linkColors[2];

// Stations radius domain/range values: min domain, max domain, min range, max range
const circleRadius = [[0.1, 1.0], [3, 15]];
// The scale factor applied to correct small rank values. In case of Demo, it is set to 25 in run.js
var rankFactor = 100;

// Links width domain/range values: min domain, max domain, min range, max range
const linkWidths = [[1, 50], [1, 5]];

// Messages to print - data
const readDataMessage = 'Reading files location';
const collectDataMessage = 'Collecting files';
const processDataMessage = 'Processing data';
const drawMapDataMessage = 'Drawing Map';

// Messages to print - gcp
const initMessage = 'Checking files';
const initClientsMessage = 'Initializing Google Cloud Clients';
const createBucketMessage = 'Creating Bucket';
const createClusterMessage = 'Creating Cluster - It may take some time';
const uploadFilesMessage = 'Uploading files to Bucket';
const submitJobsMessage = 'Submitting job to Cluster';
const downloadResultsMessage = 'Downloading results';
const deleteAllMessage = 'Deleting Bucket and Cluster';
const standardFailMessage = 'Task failed.';
const criticalFailMessage = 'TASK FAILED: unable to delete the allocated resources.';