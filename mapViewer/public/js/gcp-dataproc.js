function init() {
    spinnerText.textContent = initMessage;
    $.ajax({
        url: gcp,
        success: function(data){
            launchMapViewer();
        },
        error: function(data){
            initClients();
        },
    });
}

function initClients() {
    spinnerText.textContent = initClientsMessage;
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
    getAndWait('/dataproc/uploadFiles', true, 5000, submitJob, standardFail);
}

function submitJob() {
    spinnerText.textContent = submitJobsMessage;
    getAndWait('/dataproc/submitJob', true, 5000, downloadResults, standardFail);
}

function downloadResults() {
    spinnerText.textContent = downloadResultsMessage;
    getAndWait('/dataproc/downloadResults', true, 5000, deleteAll, standardFail);
}

function deleteAll() {
    spinnerText.textContent = deleteAllMessage;
    getAndWait('/dataproc/deleteAll', true, 5000, launchMapViewer, criticalFail);
}

function launchMapViewer() {
    start(gcp);
}

function getAndWait(url, flag, delay, successCallback, failCallback) {
    $.get(url, {run: flag}, function (data) {
        const recDone = JSON.parse(data.done);
        const recError = data.error;

        if (recError !== null) {
            failCallback(null, null, recError);

        } else if (recDone === false) {
            setTimeout(function () {
                getAndWait(url, false, delay, successCallback, failCallback);
            }, delay);

        } else {
            successCallback();
        }

    }).fail(failCallback);
}

function standardFail(jqXHR, textStatus, errorThrown) {
    spinner.hidden = true;
    spinnerText.textContent = `${errorThrown}\nDeleting All resources in 10 seconds.`;

    setTimeout(function () {
        spinner.hidden = false;
        spinnerText.textContent = deleteAllMessage;
        getAndWait('/dataproc/deleteAll', true, 5000, onTaskFailed, criticalFail)
    }, 10000);
}

function criticalFail(jqXHR, textStatus, errorThrown) {
    spinner.remove();
    spinnerText.textContent = `${errorThrown} - ${criticalFailMessage}`;
}

function onTaskFailed() {
    spinner.remove();
    spinnerText.textContent = standardFailMessage;
}