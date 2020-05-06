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

// Stations color palette: min, max, hover
const circleColors = ['#FCA107', '#7F3121', '#d0340d'];
const circleOpacity = 0.95;
const circleStrokeColor = '#472700';
const circleStrokeWidth = 0.8;
// Links color palette: none, in, out
const linkColors = ['#ead5d0', '#ff5a5a', '#ffda1f'];
const linkOpacity =  0.75;
// Stations radius domain/range values: min domain, max domain, min range, max range
const circleRadius = [[0.1, 1], [3, 15]];
const rankFactor = 100;
// Links width domain/range values: min domain, max domain, min range, max range
const linkWidths = [[0.1, 1], [1, 5]];

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
