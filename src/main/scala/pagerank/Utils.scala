package pagerank

import org.apache.spark.rdd.RDD
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
         // Working with Hadoop 3?: https://stackoverflow.com/a/50545815/9297144

         hdfs.delete(new Path(s"$path.tmp"), true)
      }
   }

}
