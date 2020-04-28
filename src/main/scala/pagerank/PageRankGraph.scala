package pagerank


import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._
import pagerank.Utils._

final case class PageRankGraph(numVertices: Id, vertices: RichVertexPairRDD, edges: OutEdgePairRDD) {

   def saveEdges(path: String, spark: SparkSession): Unit = {
      val edgRDD = edges.map {
         case (src, OutEdge(dst, weight)) => (src, dst, weight)
      }

      val dfWithSchema = spark.createDataFrame(edgRDD).toDF("source", "target", "weight")

      dfWithSchema.saveAsSingleTextFile(path)
         /*.coalesce(1)
         .write
         .format("com.databricks.spark.csv")
         .option("header", "true")
         .save(path)*/

   }

   def saveNodes(path: String, spark: SparkSession) = {
      val vertsRDD = vertices.map {
         case (id, DataVertex(value, _)) => (id, value)
      }
      val dfWithSchema = spark.createDataFrame(vertsRDD).toDF("station", "rank")

      val out = dfWithSchema.sort(desc("rank"))

      out.saveAsSingleTextFile(path)
         /*.coalesce(1)
         .write
         .format("com.databricks.spark.csv")
         .option("header", "true")
         .save(path)*/

   }

   /*def printOutAll = {
      println("vertices are:")
      vertices.take(20).foreach(println)
      //      println(s"${vertices.collect().mkString(",")}")

      println("\nedges are:")
      //      edges.collect().foreach(println)
      //      println(s"${edges.collect().mkString(",")}")
   }*/

}
