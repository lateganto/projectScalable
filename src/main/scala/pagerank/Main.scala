package pagerank

import org.apache.spark.sql.SparkSession
import Utils.{getListOfFiles, log_print}


object Main extends SparkApp {

   override def run(options: Options, spark: SparkSession): Unit = {

      val sc = spark.sparkContext

      val start_time = System.nanoTime()

      val input_dir = options.input_dir
      val input_file = options.input_file
      val output_dir = options.output_dir

      if (options.local) {

         var threads_list = List[Thread]()

         for (file <- getListOfFiles(options.input_dir)) {
            val thread = new Thread {
               override def run(): Unit = {
                  val thread_name = getName

                  log_print("STARTING COMPUTATION...", thread_name)

                  val graph = GraphBuilder.buildGraph(sc, file.getPath)
                  graph.saveEdges(output_dir + "links_" + file.getName.split("-")(0), spark, options.local)

                  val newgraph = PageRank.calculatePR(graph, options.dampingFactor, options.numIterations)
                  newgraph.saveNodes(output_dir + "ranks_" + file.getName.split("-")(0), spark, options.local)
               }
            }

            threads_list = thread :: threads_list

            thread.start()
         }

         waitIfAliveThreads(threads_list)

      } else {
         log_print("STARTING COMPUTATION...")

         val graph = GraphBuilder.buildGraph(sc, input_dir + input_file)
         graph.saveEdges(output_dir + "_links", spark, options.local)

         val newgraph = PageRank.calculatePR(graph, options.dampingFactor, options.numIterations)
         newgraph.saveNodes(output_dir + "_ranks", spark, options.local)
      }

      println(s"**** COMPUTATION FINISHED! > Elapsed time: ${(System.nanoTime() - start_time) / 1000000000f}s ****")

   }


   def waitIfAliveThreads(threads_list: List[Thread]): Unit = {

      var some_alive = true

      while (some_alive) {
         some_alive = false
         for (thread <- threads_list) {
            if (thread.isAlive) {
               some_alive = true
            }
         }

         if (some_alive)
            Thread.sleep(5000)
      }
   }

}
