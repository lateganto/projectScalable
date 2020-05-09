# SCALABLE AND CLOUD PROGRAMMING PROJECT 
***A.A. 2019/2020  -  Antonio Lategano, Salvatore Visaggi***

**Table of contents:**

* [Project Description](#project-description)
    * [Dataset](#dataset)
    * [Project Structure](#project-structure)
* [Before you begin](#before-you-begin)
* [Setting up the project](#setting-up-the-project)
    * [Explaining config.json structure](#explaining-config.json-structure)
    * [Creating the jar executable](#creating-the-jar-executable)
    * [Installing the Map Viewer app](#installing-the-map-viewer-app)
* [Running the project](#running-the-project)
* [Extra](#extra)
    * [Demo description](#demo-description)
    * [Using the gcloud console](#using-the-gcloud-console)

## Project Description
The main purpose of this project is to compute the Weighted PageRank for the bike stations of the
[CapitalBikeShare][capital_bike] network in Washington DC developing a scala-spark app.  
The PageRank of the stations is computed considering the [tripdata of the year 2019][capital_bike_data].  
The PageRank algorithm for weighted edges is a modified version taken from [NetworkX implementation][networkx_pagerank].  
The Computation is done on the Google Cloud Platform using the [Dataproc][product-docs] and Storage solutions.  
A client-server webapp is also developed to run and control the computation on the GCP using the 
[Nodejs APIs][client-docs] and to show the result on an interactive map using the [MapBox GL js APIs][mapbox-api].

### Dataset
The [dataset][capital-bike-data-source] is divided in 12 files, one for each month of the year 2019.  
Each file contains a single trip information, composed by a `Start station number`, an `End station number`,
a `Start date`, an `End date` and other properties that we have not taken in account.  
The files are stored in folder `./data/input/`.  

A trip from a `source` to a `destination` could exist more than one time. During the building of the Graph, 
firstly, it is counted the number time the same couple `source-destionation` appear as the weight of that edge. 
After, following the formula for the [weighted Pagerank][networkx_pagerank], for each station, the weight of the 
outgoing edges is normalized such that the sum of outgoing edges is 1.

For each file there are up to 350-400 thousands trips. The number of stations in the graph is 581.

### Project Structure
The project consists of a Node.js webapp and a Scala-Spark app.  
The Scala-Spark app is the core of the computation: it is developed for compute the PageRank of the stations in 
the weighted graph.  
The Node.js webapp is a client-server app. The client side runs the requests for the computation and shows the results
 of on an interactive map. The server side uses the Google Cloud Node.js APIs for uploading the files, 
 running the Scala-Spark app as a Job in a Dataproc cluster and for downloading the results. 

Below it is shown the project files and folders structure. It is useful to know for the further steps.

```
projectScalable
|
├── data
|   └── input/[input-files]
|
├── mapViewer
|   ├── bin
|   |   └── www
|   ├── public
|   |   ├── data
|   |   |   ├── demo/[demo-files]
|   |   |   ├── capitalbikeshare-stations.csv
|   |   |   └── result-demo.json
|   |   ├── js
|   |   |   ├── data.js
|   |   |   ├── gcp-dataproc.js
|   |   |   ├── geoJson.js
|   |   |   ├── map.js
|   |   |   ├── properties.js
|   |   |   └── run.js
|   |   ├── stylesheets
|   |   |   └── style.css
|   |   └── index.html
|   └── routes
|       ├── app.js
|       ├── config.json
|       ├── package.json
|       └── package-lock.json
|
├── project
|   └── plugins.sbt 
|
├── src/main/scala
|   └── pagerank
|       ├── package.scala
|       ├── GraphBuilder.scala
|       ├── Main.scala
|       ├── PageRank.scala
|       ├── PageRankGraph.scala
|       ├── SparkApp.scala
|       └── Utils.cala
|
└── build.sbt
```

## Before you begin

1.  [Select or create a Cloud Platform project][projects].
1.  [Enable billing for your project][billing].
1.  [Enable the Google Cloud Dataproc API][enable_api_dataproc].
1.  [Enable the Google Cloud Storage API][enable_api_storage].
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation. Save the JSON key and store it carefully on your local workstation for 
    further use, as explained in [Setting up the project](#setting-up-the-project).

## Setting up the project

### Explaining config.json structure
The file `config.json` is located in the folder `projectScalable/mapViewer`. This file contains the configuration
values for running the app. The structure of the configuration is shown below.
```
{
    keyFileName: string
    gcp: {
        projectId: string,
        location: string,
        bucket: {
            bucketName: string,
            storageClass: string
        },
        cluster: {
            clusterName: string,
            config: {...}
        },
        job: {
            jarFileDir: string,
            jarFileName: string,
            jarArgs: {...}
        },
        input: {
            inputPath: string,
            inputLinksFiles: [string] 
        },
        output: {...}
    }
}
```
The `keyFileName` is the path where the [key for accessing the Google Cloud APIs](#before-you-begin) is stored 
on your local workstation. **Set this value before to continue**.  
The `gcp` values are used for setting the bucket, cluster and job properties on GCP.  
Set the value `projectId` as that your key is associated. Then, set the values
 `location`, `bucketName` and `clusterName` as you like, or leave it as they are.   
 You could change the configuration of the cluster. As default, the cluster is composed of a master and
  3 workers with 2 standard cpus each one.

### Creating the jar executable
To create the fat JAR file (i.e. a jar with all the dependencies the program requires) 
we used `sbt-assembly`. To get the fat JAR, run the command below in the root folder of the project
and it will automatically create the `projectScalable.jar` file in the `data` folder of the project.
```
cd projectScalable
sbt assembly
``` 


### Installing the Map Viewer app
The MapViewer app source is located in the `mapViewer` folder. For installing and running the app, it is required 
[Node.js][nodejs-download] to be installed on your local workstation.  
For installing the required packages: 
```
cd projectScalable/mapViewer
npm install
```
After installation, for running the app:
```
npm start
```

## Running the project
Before running the project, be sure that you have followed the previous steps:
- The fat JAR has been generated and placed in the folder `data` or it is
linked in the `config.json` file.
- The key for accessing GCP apis is generated and linked in the `config.json` file.
- The `projectId` in the `config.json` is set as the key associated.

For running the project, run the command `npm start` in the `mapViewer` folder.

Once the app is running, you will see a message in the console: `listening on 3000`.  
Open a browser with javascript enabled and connect to the server `localhost:3000`.  
Once connected, you will see two buttons: `Launch Demo` and `Launch GCP`.  
`Launch Demo` loads the local files and shows few stations on the map as described in the 
[Demo section](#demo-description).

`Launch GCP` runs the operations for running the Scala-Spark on a Google Cloud Dataproc Cluster.
The step done are listed below:
- Initialization of Clients for connecting to Google CLoud APIs.
- Creation of the Bucket.
- Creation of the Cluster with the specified configuration (this may take up to 90s).
- Upload of input files and JAR file to the Bucket.
- Submit of the Job to the cluster.
- Download of the results computed by the Job.
- Launch of the client app for viewing the map.
 
## Extra

### Demo description
The demo is made for showing an example of the result of computing the PageRank.
In the demo it is shown only about 50 stations.

### Using the gcloud console

quello che aveva messo antonio ma modificato



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
[capital_bike]: https://www.capitalbikeshare.com/
[capital_bike_data]: https://www.capitalbikeshare.com/system-data

[networkx_pagerank]: https://networkx.github.io/documentation/networkx-1.10/reference/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html

[mapbox-api]: https://docs.mapbox.com/mapbox-gl-js/api/

[capital-bike-data-source]: https://s3.amazonaws.com/capitalbikeshare-data/index.html

[nodejs-download]: https://nodejs.org/en/download/