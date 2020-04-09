package pagerank

import org.apache.spark.sql.SparkSession

object Main extends SparkApp {

   override def run(args: Array[String], spark: SparkSession): Unit = {

      val input_path = "C:\\Users\\Antonio\\IdeaProjects\\projectScalable\\202001-capitalbikeshare-tripdata.csv"

      val sc = spark.sparkContext

      val graph = GraphBuilder.buildGraph(sc, input_path)

      val newgraph = PageRank.calculatePR(graph, 0.85, 2)

//      newgraph.vertices.collect.sortWith()

   }

}
