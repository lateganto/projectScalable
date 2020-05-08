var express = require('express');
var router = express.Router();

const fs = require('fs');
const sleep = require('sleep');
const config = require('../config.json');
const {Storage} = require('@google-cloud/storage');
const dataproc = require('@google-cloud/dataproc');

let done = false;
let error = null;

function runRequest(request) {
    done = false;
    error = null;

    request()
        .then(() => {
            done = true;
        })
        .catch(e => {
            error = e.message;
        });
}

router.get('/', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(initClients);
    }

    res.status(200).json({done: done, run: run, error: error});
});

router.get('/createBucket', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(createBucket);
    }

    res.status(200).json({done: done, run: run, error: error});
});

router.get('/createCluster', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(createCluster);
    }

    res.status(200).json({done: done, run: run, error: error});
});

router.get('/uploadFiles', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(uploadFiles);
    }

    res.status(200).json({done: done, run: run, error: error});
});

router.get('/submitJob', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(submitJob);
    }

    res.status(200).json({done: done, run: run, error: error});
});

router.get('/downloadResults', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(downloadResults);
    }

    res.status(200).json({done: done, run: run, error: error});
});

router.get('/deleteAll', function (req, res, next) {
    var run = JSON.parse(req.query.run);

    if (run === true) {
        run = false;
        runRequest(deleteAllResources);
    }

    res.status(200).json({done: done, run: run, error: error});
});

let storage = null;
let clusterClient = null;
let jobClient = null;

async function initClients() {
    const projectId = config.gcp.projectId;
    const keyFilename = config.keyFilename;
    const location = config.gcp.location;

    storage = new Storage({projectId, keyFilename});
    console.log(`Storage for project ${projectId} created.`);

    clusterClient = new dataproc.v1beta2.ClusterControllerClient({
        apiEndpoint: `${location}-dataproc.googleapis.com`,
        keyFilename: keyFilename,
        projectId: projectId
    });
    console.log(`Cluster client for project ${projectId} created.`);

    jobClient = new dataproc.v1beta2.JobControllerClient({
        apiEndpoint: `${location}-dataproc.googleapis.com`,
        keyFilename: keyFilename,
        projectId: projectId
    });
    console.log(`Job client for project ${projectId} created.`);
}

async function createBucket() {
    const bucketName = config.gcp.bucket.bucketName;
    const storageClass = config.gcp.bucket.storageClass;
    const location = config.gcp.location;

    const [bucket] = await storage.createBucket(bucketName, {
        location: location.toUpperCase(),
        storageClass: storageClass.toUpperCase()
    });

    console.log(`Bucket ${bucket.name} created.`);
}

async function createCluster() {
    const projectId = config.gcp.projectId;
    const location = config.gcp.location;

    const request = {
        projectId: projectId,
        region: location,
        cluster: config.gcp.cluster
    };

    const [operation] = await clusterClient.createCluster(request);

    console.log(`Waiting for response`);
    const [response] = await operation.promise();

    console.log(`Cluster created successfully: ${response.clusterName}`);
}

async function uploadFile(options) {
    const fileDir = options.fileDir;
    const file = options.file;
    const bucketName = options.bucketName;
    const gsDir = options.gsDir;

    const filename = `${fileDir}/${file}`;
    await storage.bucket(bucketName).upload(filename, {
        // Support for HTTP requests made with `Accept-Encoding: gzip`
        gzip: false,
        destination: `${gsDir}${file}`,
        metadata: {
            // Enable long-lived HTTP caching headers
            // Use only if the contents of the file will never change
            // (If the contents will change, use cacheControl: 'no-cache')
            cacheControl: 'public, max-age=31536000',
        }
    });

    console.log(`${filename} uploaded to ${bucketName}.`);
}

async function uploadFiles() {
    const inputFileNames = config.input.inputLinksFiles;
    const inputPath = config.input.inputPath;
    const bucketName = config.gcp.bucket.bucketName;
    const jarFileDir = config.gcp.job.jarFileDir;
    const jarFileName = config.gcp.job.jarFileName;

    var uploads = []
    uploads.push(uploadFile({fileDir: jarFileDir, file: jarFileName, gsDir: '', bucketName: bucketName}));

    for (var i = 0; i < inputFileNames.length; i++) {
        uploads.push(uploadFile(
            {fileDir: inputPath, file: inputFileNames[i], gsDir: 'input/', bucketName: bucketName}));
    }

    await Promise.all(uploads);
    console.log(`All files are uploaded to ${bucketName}.`);
}

async function submitJob() {
    const projectId = config.gcp.projectId;
    const location = config.gcp.location;
    const bucketName = config.gcp.bucket.bucketName;
    const jarFileName = config.gcp.job.jarFileName;
    const clusterName = config.gcp.cluster.clusterName;
    const jarArgs = config.gcp.job.jarArgs;
    const mainJarFileUri = `gs://${bucketName}/${jarFileName}`;

    const job = {
        projectId: projectId,
        region: location,
        job: {
            placement: {
                clusterName: clusterName
            },
            sparkJob: {
                mainJarFileUri: mainJarFileUri,
                args: [
                    `${jarArgs.inputDir}=gs://${bucketName}/input/`,
                    `${jarArgs.outputDir}=gs://${bucketName}/output/`
                ]
            }
        },
    };

    let [jobResp] = await jobClient.submitJob(job);
    const jobId = jobResp.reference.jobId;

    console.log(`Submitted job "${jobId}".`);

    const terminalStates = new Set(['DONE', 'ERROR', 'CANCELLED']);

    // Create a timeout such that the job gets cancelled if not
    // in a termimal state after a fixed period of time.
    const timeout = 600000;
    const start = new Date();

    // Wait for the job to finish.
    const jobReq = {
        projectId: projectId,
        region: location,
        jobId: jobId,
    };

    while (!terminalStates.has(jobResp.status.state)) {
        if (new Date() - timeout > start) {
            await jobClient.cancelJob(jobReq);
            console.log(
                `Job ${jobId} timed out after threshold of ` +
                `${timeout / 60000} minutes.`
            );
            break;
        }
        await sleep.sleep(1);
        [jobResp] = await jobClient.getJob(jobReq);
    }

    const clusterReq = {
        projectId: projectId,
        region: location,
        clusterName: clusterName,
    };

    const [clusterResp] = await clusterClient.getCluster(clusterReq);

    const output = await storage
        .bucket(clusterResp.config.configBucket)
        .file(
            `google-cloud-dataproc-metainfo/${clusterResp.clusterUuid}/` +
            `jobs/${jobId}/driveroutput.000000000`
        )
        .download();

    console.log(
        `Job ${jobId} finished with state ${jobResp.status.state}:\n${output}`
    );

    if (jobResp.status.state !== 'DONE') {
        throw new Error(`Job ${jobId} finished with state ${jobResp.status.state}. See Console for details.`);
    }
}

async function getJobResultFiles(options) {
    const bucketName = options.bucketName;
    const typeResult = options.typeResult;
    const inputFileName = options.inputFileName;
    const dataDir = options.dataDir;
    const outputDir = options.outputDir;

    const [files] = await storage.bucket(bucketName).getFiles({
        autoPaginate: false,
        prefix: `output/${inputFileName}_${typeResult}/part-00000`
    });

    const filename = files[0].name;

    const jsonFilename = `.${dataDir}/${typeResult}_${inputFileName}`;
    const saveFilename = `${outputDir}/${typeResult}_${inputFileName}`;
    await storage.bucket(bucketName).file(filename).download({
        destination: saveFilename
    })

    console.log(
        `gs://${bucketName}/${filename} downloaded to ${saveFilename}.`)

    return jsonFilename;
}

async function downloadResults() {
    const bucketName = config.gcp.bucket.bucketName;
    const typeResults = config.output.typeResults;
    const inputFileNames = config.input.inputLinksFiles;
    const publicDir = config.output.publicDir;
    const dataDir = config.output.dataDir;

    const outputDir = `${publicDir}${dataDir}`

    var links_downloads = [];
    var ranks_downloads = [];
    for (var i = 0; i < inputFileNames.length; i++) {

        links_downloads.push(
            getJobResultFiles({
                bucketName: bucketName,
                typeResult: typeResults[0],
                inputFileName: inputFileNames[i],
                dataDir: dataDir,
                outputDir: outputDir
            })
        );

        ranks_downloads.push(
            getJobResultFiles({
                bucketName: bucketName,
                typeResult: typeResults[1],
                inputFileName: inputFileNames[i],
                dataDir: dataDir,
                outputDir: outputDir
            })
        );
    }

    const links = await Promise.all(links_downloads);
    const ranks = await Promise.all(ranks_downloads);

    console.log('All file are downloaded')

    const resultJson = {
        files: {
            stations: `.${dataDir}/${config.output.nodesFile}`,
            ranks: ranks,
            links: links
        }
    }

    const jsonResultFile = `${outputDir}/result.json`;

    await fs.writeFile(jsonResultFile, JSON.stringify(resultJson), function (error) {
        if (error) {
            throw error
        }

        console.log(`json generated: ${jsonResultFile}`);
    });
}

async function deleteAllResources() {
    const projectId = config.gcp.projectId;
    const location = config.gcp.location;
    const clusterName = config.gcp.cluster.clusterName;
    const bucketName = config.gcp.bucket.bucketName;

    // By default, if a file cannot be deleted, this method will stop deleting
    // files from your bucket. You can override this setting with `force: true
    await storage.bucket(bucketName).deleteFiles({force: true});
    await storage.bucket(bucketName).delete();
    console.log(`Bucket ${bucketName} successfully deleted.`);

    const clusterReq = {
        projectId: projectId,
        region: location,
        clusterName: clusterName,
    };

    const [clusterResp] = await clusterClient.getCluster(clusterReq);

    const [deleteOperation] = await clusterClient.deleteCluster(clusterReq);
    await deleteOperation.promise();
    console.log(`Cluster ${clusterName} successfully deleted.`);
}

module.exports = router;