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
// Links color palette: none, in, out
const linkColors = ['#6aa5fc', '#ff5a5a', '#ffda1f'];
// Stations radius domain/range values: min domain, max domain, min range, max range
const circleRadius = [[0.1, 1], [3, 15]];
const rankFactor = 100;
// Links width domain/range values: min domain, max domain, min range, max range
const linkWidths = [[0.1, 1], [1, 5]];

// Messages to print
const initMessage = 'Initializing Google Cloud Clients';
const createBucketMessage = 'Creating Bucket';
const createClusterMessage = 'Creating Cluster - It may take some time';
const uploadFilesMessage = 'Uploading files to Bucket';
const submitJobsMessage = 'Submitting job to Cluster';
const downloadResultsMessage = 'Downloading results';
const deleteAllMessage = 'Deleting Cluster and Bucket';
const standardFailMessage = 'Task failed. Check the Errors and try again.';
const criticalFailMessage = 'TASK FAILED: unable to delete the allocated resources on GCP Dataproc.';
