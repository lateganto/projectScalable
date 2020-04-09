package pagerank

import org.apache.spark.sql.SparkSession

trait SparkApp {

   def run(args: Array[String], spark: SparkSession): Unit

   def main(args: Array[String]): Unit = {

      val spark = SparkSession.builder
         .master("local")
         .appName("Test")
         .getOrCreate()

      setupLogging(spark)

      run(args, spark)
      spark.stop()
   }


   def setupLogging(spark: SparkSession): Unit =
      spark.sparkContext.setLogLevel("WARN")

}
