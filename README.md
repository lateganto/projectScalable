# SCALABLE AND CLOUD PROGRAMMING PROJECT 
***Antonio Lategano, Salvatore Visaggi***

**Table of contents:**

* [Project Description](#project-description)
    * [Dataset](#dataset)
    * [Project Structure](#project-structure)
* [Before you begin](#before-you-begin)
* [Setting up the project](#setting-up-the-project)
    * [Installing the Map Viewer app](#installing-the-map-viewer-app)
    * [Explaining config.json structure](#explaining-config.json-structure)
    * [Creating the jar executable](#creating-the-jar-executable)
* [Running the project](#running-the-project)
* [Extra](#extra)
    * [Demo description](#demo-description)
    * [Using the gcloud console](#using-the-gcloud-console)

## Project Description

### Dataset

### Project Structure

## Before you begin

1.  [Select or create a Cloud Platform project][projects].
1.  [Enable billing for your project][billing].
1.  [Enable the Google Cloud Dataproc API][enable_api_dataproc].
1.  [Enable the Google Cloud Storage API][enable_api_storage].
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation. Save the JSON key and store it carefully on your local workstation for 
    further use, as explained in [Setting up the project](#setting-up-the-project).

## Setting up the project

### Installing the Map Viewer app

### Explaining config.json structure

### Creating the jar executable

## Running the project

## Extra

### Demo description

### Using the gcloud console



## Setup

### Set up a Google Cloud Account
To start the project on the cloud you have to open 
a Google Cloud account (if it's your first time you can get 250$ credit for free).  

### Create a new Google Cloud project
After that you have to create a Google Cloud project and enable billing and Dataproc API. Follow this link to know how: 
https://cloud.google.com/dataproc/docs/guides/setup-project?authuser=2`

```
gcloud projects create pagerank-project`
```

### Create a new bucket
This command allows you to create a new bucket used to store all the data required to 
the project and is used to store all the results. 
```
gsutil mb -p pagerank-project -l US-CENTRAL1 -c STANDARD gs://pagerank-bucket/
```
### Create a cluster 
This below is an example with three nodes: a master and two workers. You are free to 
apply changes. Bear in mind that the actual image-version (1.5-debian10) has the
correct version of Scala and Spark. 
```
gcloud dataproc clusters create pagerank-cluster
--region us-central1
--subnet default
--zone us-central1-a
--master-machine-type n1-standard-1
--master-boot-disk-size 30
--num-workers 2
--worker-machine-type n1-standard-1
--worker-boot-disk-size 30
--image-version 1.5-debian10
--project pagerank-project`
```

#### Create the jar
To create the fat JAR file (i.e. a jar with all the dependencies the program requires) 
we used `sbt-assembly`. So start your **sbt console**, run the command below and it will 
automatically create the jar.
```
assembly
``` 

#### Copy jar and input files to Cloud Storage
```
gsutil cp [your_local_path]/projectScalable-assembly-0.1.jar gs://pagerank-bucket/
gsutil cp [your_local_path]/input.csv gs://pagerank-bucket/
```

#### Submit jar to a Cloud Dataproc Spark job
```
gcloud dataproc jobs submit spark --cluster pagerank-cluster
    --jar gs://pagerank-bucket/projectScalable-assembly-0.1.jar 
    -- gs://pagerank-bucket/input.csv
```

#### Delete the cluster and the bucket
```
gcloud dataproc clusters delete pagerank-cluster
gsutil rm -r gs://pagerank-bucket/
```



[client-docs]: https://googleapis.dev/nodejs/dataproc/latest
[product-docs]: https://cloud.google.com/dataproc
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api_dataproc]: https://console.cloud.google.com/flows/enableapi?apiid=dataproc.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started



[enable_api_storage]: https://console.cloud.google.com/flows/enableapi?apiid=storage-api.googleapis.com
