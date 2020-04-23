name := "projectScalable"
version := "0.1"
scalaVersion := "2.12.11"

val spark_version = "2.4.5"

libraryDependencies ++= Seq(
   "org.apache.spark" %% "spark-core" % spark_version,
   "org.apache.spark" %% "spark-sql" % spark_version,
   "org.apache.spark" %% "spark-graphx" % spark_version
)