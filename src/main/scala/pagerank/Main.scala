package pagerank

import org.apache.spark.sql.SparkSession

object Main extends SparkApp {

   override def run(args: Array[String], spark: SparkSession): Unit = {

      val sc = spark.sparkContext

      val input_path = args(0)

      val graph = GraphBuilder.buildGraph(sc, input_path)

      val newgraph = PageRank.calculatePR(graph, 0.85, 2)

      newgraph.vertices.collect.sortWith((x, y) => x._2.value > y._2.value).foreach(println)

   }

}
