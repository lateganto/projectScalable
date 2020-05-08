package pagerank

import org.apache.spark.sql.SparkSession
import pagerank.Utils.{getListOfFiles, log_print}

object Main extends SparkApp {

   val timeout = 5000

   override def run(options: Options, spark: SparkSession): Unit = {

      val sc = spark.sparkContext

      val startTime = System.nanoTime()

      val inputDir = options.input_dir
      val outputDir = options.output_dir

      var threads_list = List[Thread]()

      for (file <- getListOfFiles(inputDir, sc)) {
         val thread = new Thread {
            override def run(): Unit = {
               val thread_name = getName

               log_print("STARTING COMPUTATION...", thread_name)

               val graph = GraphBuilder.buildGraph(sc, inputDir + file)
               graph.saveEdges(outputDir + file + "_links", spark, options.local)

               val newgraph = PageRank.calculatePR(graph, options.dampingFactor, options.numIterations)
               newgraph.saveNodes(outputDir + file + "_ranks", spark, options.local)
            }
         }

         threads_list = thread :: threads_list
         thread.start()
      }

      waitUntilAliveThreads(threads_list)

      println(s"*** COMPUTATION FINISHED! > Elapsed time: ${(System.nanoTime() - startTime) / 1000000000f}s ***")

   }

   def waitUntilAliveThreads(threads_list: List[Thread]): Unit = {

      var some_alive = true
      while (some_alive) {
         some_alive = false
         for (thread <- threads_list) {
            if (thread.isAlive) {
               some_alive = true
            }
         }

         if (some_alive)
            Thread.sleep(timeout)
      }
   }

}
