name := "projectScalable"
version := "0.1"
scalaVersion := "2.12.10"

val spark_version = "2.4.5"

libraryDependencies ++= Seq(
   "args4j" % "args4j" % "2.0.31",
   "org.apache.spark" %% "spark-core" % spark_version,
   "org.apache.spark" %% "spark-sql" % spark_version,
   "org.apache.spark" %% "spark-graphx" % spark_version
)

assemblyMergeStrategy in assembly := {
   case "git.properties" => MergeStrategy.first
   case PathList("javax", "inject", xs@_*) => MergeStrategy.first
   case PathList("org", "aopalliance", "aop", xs@_*) => MergeStrategy.first
   case PathList("org", "aopalliance", "intercept", xs@_*) => MergeStrategy.first
   case PathList("org", "apache", "commons", "collections", xs@_*) => MergeStrategy.first
   case PathList("org", "apache", "hadoop", "yarn", "factories", xs@_*) => MergeStrategy.first
   case PathList("org", "apache", "hadoop", "yarn", "factory", "providers", xs@_*) => MergeStrategy.first
   case PathList("org", "apache", "hadoop", "yarn", "util", xs@_*) => MergeStrategy.first
   case PathList("org", "apache", "spark", "unused", xs@_*) => MergeStrategy.first
   case x =>
      val oldStrategy = (assemblyMergeStrategy in assembly).value
      oldStrategy(x)
}

assemblyOutputPath in assembly := file("data/projectScalable.jar")