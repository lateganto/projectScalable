package pagerank

import org.apache.spark.rdd.RDD

object PageRank {

   def calculatePR(graph: PageRankGraph, damping_factor: Double, n_iter: Int): PageRankGraph = {

      graph.vertices.unpersist()

      var iteration = 0
      var updatedVertices: RichVertexPairRDD = graph.vertices
      var danglesum = 0.0
      var incomingWeightedSum: RDD[(Id, Double)] = null

      while (iteration < n_iter) {

         //sum of the PR_values of dangling nodes
         danglesum = damping_factor * updatedVertices
            .map(v =>
               if (v._2.isDangling) v._2.value
               else 0.0
            )
            .sum()

         println("danglesum is: " + danglesum)

         /* Compute the incoming contributions for each vertex.
            (Every node sends to the adjacent nodes a contribution proportional to the
            strength of the tie tha connects them)*/
         incomingWeightedSum = graph.edges
            .join(updatedVertices)
            .map { case (_, (edge, vertexData)) =>
               (edge.dstId, vertexData.value * edge.weight)
            }
            .reduceByKey(_ + _)

         updatedVertices = updateVertices(
            graph.edges,
            updatedVertices,
            graph.numVertices,
            incomingWeightedSum,
            danglesum,
            damping_factor)


         iteration += 1
      }

      PageRankGraph(graph.numVertices, updatedVertices.persist(), graph.edges)

   }

   def updateVertices(edges: OutEdgePairRDD,
                      vertices: RichVertexPairRDD,
                      numVertices: Long,
                      incomingWeightedSum: RDD[(Id, Double)],
                      danglesum: Double,
                      damping_factor: Double): RichVertexPairRDD = {
      vertices
         .leftOuterJoin(incomingWeightedSum)
         .map {
            case (id, (vertex_data, rankUpdate)) =>
               val newValue = danglesum / numVertices +
                  damping_factor * rankUpdate.getOrElse(0.0) +
                  (1 - damping_factor) / numVertices

               (id, vertex_data.withNewValue(newValue))
         }
   }

}
