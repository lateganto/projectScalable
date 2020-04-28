package pagerank

import java.io.File

import org.apache.spark.sql.SparkSession
import org.kohsuke.args4j.{CmdLineParser, Option}

/*class MyRunnable extends Runnable {

   override def run(): Unit = {

   }

}*/


object Main extends SparkApp {

   class Options {
      @Option(name = "--input", usage = "Input path containing starting and ending stations in CSV format (start_station, end_station, month)", required = true)
      var input: String = _

      @Option(name = "--output_folder", usage = "Output directory for the files containing the rank values for every station" /*, required = true*/)
      var output: String = _

      @Option(name = "--numIterations", usage = "Number of iterations to use for the PageRank algorithm, default=10")
      var numIterations: Int = 10

      @Option(name = "--dampingFactor", usage = "Damping parameter for PageRank, default=0.85")
      var dampingFactor: Double = 0.85
   }

   override def run(args: Array[String], spark: SparkSession): Unit = {

      val options = new Options()

      new CmdLineParser(options).parseArgument(args: _*)

      val sc = spark.sparkContext

      val listFiles = getListOfFiles(options.input)

      for (file <- listFiles) {
         println("FILE: " + file.getPath)
         val graph = GraphBuilder.buildGraph(sc, file.getPath)
         graph.saveEdges("data/output/links_" + file.getName.split("-")(0), spark)

         val newgraph = PageRank.calculatePR(graph, options.dampingFactor, options.numIterations)
         newgraph.saveNodes("data/output/ranks_" + file.getName.split("-")(0), spark)
      }

      //      val graph = GraphBuilder.buildGraph(sc, options.input)
      //
      //      graph.saveEdges("data/output/edges1.csv", spark)
      //
      //      val newgraph = PageRank.calculatePR(graph, options.dampingFactor, options.numIterations)
      //
      //      newgraph.saveNodes("data/output/nodes1.csv", spark)


   }

   def getListOfFiles(dir: String): List[File] = {
      val d = new File(dir)
      if (d.exists && d.isDirectory) {
         d.listFiles.filter(_.isFile).toList
      } else {
         List[File]()
      }
   }

}
