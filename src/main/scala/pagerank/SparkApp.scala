package pagerank

import org.apache.spark.sql.SparkSession
import org.kohsuke.args4j.{CmdLineException, CmdLineParser, Option}
import Utils.setupLogging

trait SparkApp {

   class Options {
      @Option(name = "--input_dir", usage = "Input directory path containing CSV information about the stations", required = true)
      var input_dir: String = _

      @Option(name = "--input_file", usage = "Input path containing CSV information about the stations\n" +
         "(Do not use in local mode!)")
      var input_file: String = ""

      @Option(name = "--output_dir", usage = "Output directory path for the ranks and links CSV files. \n" +
         "(default=same folder of executable)")
      var output_dir: String = "./"

      @Option(name = "--numIterations", usage = "Number of iterations to use for the PageRank algorithm \n(default=10)")
      var numIterations: Int = 10

      @Option(name = "--dampingFactor", usage = "Damping parameter for PageRank \n(default=0.85)")
      var dampingFactor: Double = 0.85

      @Option(name = "--local", usage = "If you want to run Spark in local")
      var local: Boolean = false
   }

   def run(options: Options, spark: SparkSession): Unit

   private def start(options: Options): Unit = {
      var spark: SparkSession = null

      if (options.local) {
         spark = SparkSession
            .builder
            .master("local[*]")
            .appName("ScalableWeightedPageRank")
            .getOrCreate()
      } else {
         spark = SparkSession
            .builder
            .appName("ScalableWeightedPageRank")
            .getOrCreate()
      }

      setupLogging(spark)
      run(options, spark)
      spark.stop()
   }

   def main(args: Array[String]): Unit = {

      val options = new Options()
      val parser: CmdLineParser = new CmdLineParser(options)

      try {
         parser.parseArgument(args: _*)
         start(options)

      } catch {
         case e: CmdLineException =>
            // handling of wrong arguments
            System.err.println(e.getMessage)

            println("")
            parser.printUsage(System.err)
      }
   }
}
