# SCALABLE AND CLOUD PROGRAMMING PROJECT 
### A.A. 2019-2020

##### Antonio Lategano
##### Salvatore Visaggi

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