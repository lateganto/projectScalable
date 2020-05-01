package pagerank

import java.io.File

import org.apache.spark.sql.SparkSession

import scala.reflect.io.Directory

object Utils {

   /*
      Returns a list of the files in a specified folder
    */
   def getListOfFiles(dir: String): List[File] = {
      val d = new File(dir)
      if (d.exists && d.isDirectory) {
         d.listFiles.filter(_.isFile).toList
      } else {
         List[File]()
      }
   }

   def log_print(msg: String, thread_name: String): Unit = {
      println("[" + thread_name + "] --- " + msg)
   }

   def log_print(msg: String): Unit = {
      println(msg)
   }

   def deleteFolderIfExists(path: String): Unit = {
      val file = new File(path)
      val directory = new Directory(file)
      if (directory.exists) {
         directory.deleteRecursively()
      }
   }

   def setupLogging(spark: SparkSession): Unit =
      spark.sparkContext.setLogLevel("WARN")

   /*


      Class that helps saving an RDD to a CSV format file without unnecessary other files that Spark produces

   implicit class DFExtensions(val df: DataFrame) extends AnyVal {

      def saveAsSingleTextFile(path: String): Unit = {
         // The interface with hdfs:
         val hdfs = FileSystem.get(df.sparkSession.sparkContext.hadoopConfiguration)

         // Classic saveAsTextFile in a temporary folder:
         hdfs.delete(new Path(s"$path.tmp"), true) // to make sure it's not there already
         df.coalesce(1)
            .write
            .format("com.databricks.spark.csv")
            .option("header", "true")
            .save(s"$path.tmp")

         // Merge the folder of resulting part-xxxxx into one file:
         hdfs.delete(new Path(path), true) // to make sure it's not there already
         FileUtil.copyMerge(
            hdfs, new Path(s"$path.tmp"),
            hdfs, new Path(path + ".csv"),
            true, df.sparkSession.sparkContext.hadoopConfiguration, null
         )

         hdfs.delete(new Path(s"$path.tmp"), true)
      }
   }*/
}
