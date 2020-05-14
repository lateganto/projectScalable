package pagerank

import org.apache.spark.rdd.RDD
import pagerank.Utils.log_print

object PageRank {

   def calculatePR(graph: PageRankGraph, damping_factor: Double, n_iter: Int): PageRankGraph = {

      val start_time = System.nanoTime()
      val current_thread = Thread.currentThread().getName

      log_print("STARTING PAGERANK...", current_thread)

      var iteration = 0
      var updatedVertices: RichVertexPairRDD = graph.vertices
      graph.vertices.unpersist()
      updatedVertices.persist()

      while (iteration < n_iter) {

         //sum of the PR_values of dangling nodes
         val danglesum = updatedVertices
            .map(v =>
               if (v._2.isDangling) v._2.value
               else 0.0
            )
            .sum()

         log_print("ITERATION " + iteration + ". " + "Danglesum is: " + danglesum, current_thread)

         /* Compute the incoming contributions for each vertex.
            (Every node sends to the adjacent nodes a contribution proportional to the
            strength of the tie tha connects them)*/
         val incomingWeightedSum = graph.edges
            .join(updatedVertices)
            .map { case (_, (edge, vertexData)) =>
               (edge.dstId, vertexData.value * edge.normalizedWeight)
            }
            .reduceByKey(_ + _)

         updatedVertices = updateVertices(
            updatedVertices,
            graph.numVertices,
            incomingWeightedSum,
            danglesum,
            damping_factor)


         iteration += 1
      }

      log_print(s"PAGERANK DONE! > Elapsed time: ${(System.nanoTime - start_time)/1000000000f}s" , current_thread)

      PageRankGraph(graph.numVertices, updatedVertices, graph.edges)

   }

   def updateVertices(vertices: RichVertexPairRDD,
                      numVertices: Long,
                      incomingWeightedSum: RDD[(Id, Double)],
                      danglesum: Double,
                      damping_factor: Double): RichVertexPairRDD = {
      vertices
         .leftOuterJoin(incomingWeightedSum)
         .map {
            case (id, (vertex_data, rankUpdate)) =>
               val newValue = damping_factor * danglesum / numVertices +
                  damping_factor * rankUpdate.getOrElse(0.0) +
                  (1 - damping_factor) / numVertices

               (id, vertex_data.setNewValue(newValue))
         }
   }

}
