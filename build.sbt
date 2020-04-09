name := "projectScalable"

version := "0.1"

scalaVersion := "2.12.1"

val spark_version = "2.4.5"

libraryDependencies ++= Seq(
   "org.apache.spark" % "spark-core_2.12" % spark_version % "provided",
   "org.apache.spark" % "spark-sql_2.12" % spark_version,
   "org.apache.spark" % "spark-graphx_2.12" % spark_version
)