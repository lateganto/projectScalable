package pagerank

import org.apache.spark.sql.SparkSession
import org.kohsuke.args4j.{CmdLineParser, Option}
import Utils._

object Main extends SparkApp {

   class Options {
      @Option(name = "--input_dir", usage = "Input directory path containing data of the stations in CSV format (start_station, end_station)", required = true)
      var input: String = _

      @Option(name = "--output_dir", usage = "Output directory path for the rank and links CSV files", required = true)
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

      for (file <- getListOfFiles(options.input)) {
         val thread = new Thread {
            override def run(): Unit = {
               println("FILE: " + file.getPath)
               val graph = GraphBuilder.buildGraph(sc, file.getPath)
               graph.saveEdges(options.output + "links_" + file.getName.split("-")(0), spark)

               val newgraph = PageRank.calculatePR(graph, options.dampingFactor, options.numIterations)
               newgraph.saveNodes(options.output + "ranks_" + file.getName.split("-")(0), spark)

            }
         }

         thread.start()
      }

//      spark.stop()

   }

}
