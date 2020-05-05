package pagerank

import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import pagerank.Utils._

final case class PageRankGraph(numVertices: Id, vertices: RichVertexPairRDD, edges: OutEdgePairRDD) {

   def saveEdges(path: String, spark: SparkSession, local: Boolean): Unit = {

      val start_time = System.nanoTime()
      log_print("Saving links in " + path, Thread.currentThread().getName)

      if (local) deleteFolderIfExists(path)

      val edgRDD = edges.map {
         case (src, OutEdge(dst, weight)) => (src, dst, weight)
      }

      val dfWithSchema = spark.createDataFrame(edgRDD).toDF("source", "target", "weight")

      dfWithSchema.coalesce(1)
         .write
         .format("com.databricks.spark.csv")
         .option("header", "true")
         .save(path)

      log_print(s"SAVING LINKS DONE! > Elapsed time: ${(System.nanoTime - start_time) / 1000000000f}s",
         Thread.currentThread().getName)
   }

   def saveNodes(path: String, spark: SparkSession, local: Boolean): Unit = {

      val start_time = System.nanoTime()
      log_print("Saving links in " + path, Thread.currentThread().getName)

      if (local) deleteFolderIfExists(path)

      val vertsRDD = vertices.map {
         case (id, DataVertex(value, _)) => (id, value)
      }

      val dfWithSchema = spark.createDataFrame(vertsRDD).toDF("station", "rank")

      val out = dfWithSchema.sort(desc("rank"))

      out.coalesce(1)
         .write
         .format("com.databricks.spark.csv")
         .option("header", "true")
         .save(path)

      log_print(s"SAVING RANKS DONE! > Elapsed time: ${(System.nanoTime - start_time)/1000000000f}s" ,
         Thread.currentThread().getName)

   }

}