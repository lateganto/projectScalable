package pagerank

import java.io.File

import org.apache.hadoop.fs.{FileSystem, FileUtil, Path}
import org.apache.hadoop.io.compress.CompressionCodec
import org.apache.spark.sql.{DataFrame, Row}

object Utils {

   /*
      Class that helps saving an RDD to a CSV format file without unnecessary other files that Spark produces
    */
   implicit class DFExtensions(val df: DataFrame) extends AnyVal {

      def saveAsSingleTextFile[U](path: String): Unit =
         saveAsSingleTextFileInternal(path, None)

      private def saveAsSingleTextFileInternal[U](
                                                    path: String,
                                                    codec: Option[Class[_ <: CompressionCodec]]): Unit = {

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
   }

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

}
