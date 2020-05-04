function init() {
    spinnerText.textContent = initMessage;
    getAndWait('/dataproc', true, 1000, createBucket, standardFail);
}

function createBucket() {
    spinnerText.textContent = createBucketMessage;
    getAndWait('/dataproc/createBucket', true, 2000, createCluster, standardFail);
}

function createCluster() {
    spinnerText.textContent = createClusterMessage;
    getAndWait('/dataproc/createCluster', true, 10000, uploadFiles, standardFail);
}

function uploadFiles() {
    spinnerText.textContent = uploadFilesMessage;
    getAndWait('/dataproc/uploadFiles', true, 2000, submitJobs, standardFail);
}

function submitJobs() {
    spinnerText.textContent = submitJobsMessage;
    getAndWait('/dataproc/submitJobs', true, 2000, downloadResults, standardFail);
}

function downloadResults() {
    spinnerText.textContent = downloadResultsMessage;
    getAndWait('/dataproc/downloadResults', true, 2000, deleteAll, standardFail);
}

function deleteAll() {
    spinnerText.textContent = deleteAllMessage;
    getAndWait('/dataproc/deleteAll', true, 2000, launchMapViewer, standardFail);
}

function launchMapViewer() {
    start(gcp);
}

function getAndWait(url, flag, delay, successCallback, failCallback) {
    console.log('sending flag: ' + flag)

    $.get(url, {run: flag}, function (data) {
        const recRun = JSON.parse(data.run);
        const recDone = JSON.parse(data.done);
        const recError = data.error;

        console.log('just received flags: ' + recRun + ' - ' + recDone + ' : ' + recError)

        if (recError !== null) {

            console.log('calling fail');
            console.log(recError);
            failCallback(null, null, recError);

        } else if (recDone === false) {

            setTimeout(function () {
                getAndWait(url, false, delay, successCallback, failCallback);  // Call the loop again after delay
            }, delay);

        } else {
            console.log('calling success');
            successCallback()
        }

        /*
        if (recDone === false && recError === null) {
            setTimeout(function () {
                getAndWait(url, false, delay, successCallback, failCallback);  // Call the loop again after delay
            }, delay);
        } else if (recError !== null) {

            console.log('calling fail');
            console.log(recError);
            throw recError;

        } else {
            console.log('calling success');
            successCallback()
        }

         */
    }).fail(failCallback)

}


function standardFail(jqXHR, textStatus, errorThrown) {
    spinner.hidden = true;
    spinnerText.textContent = `${errorThrown}  -  Deleting All resources in 10 seconds.`;

    setTimeout(function () {
        spinner.hidden = false;
        spinnerText.textContent = deleteAllMessage;
        getAndWait('/dataproc/deleteAll', true, 2000, onTaskFailed, criticalFail)
    }, 10000);
}

function criticalFail(jqXHR, textStatus, errorThrown) {
    spinner.remove();
    spinnerText.textContent = `${errorThrown}  -  ${criticalFailMessage}`;
}

function onTaskFailed() {
    spinner.remove();
    spinnerText.textContent = standardFailMessage;
}