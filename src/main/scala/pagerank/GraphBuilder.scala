package pagerank

import org.apache.spark.SparkContext
import org.apache.spark.rdd.RDD
import pagerank.Utils.log_print


object GraphBuilder {

   def buildGraph(sc: SparkContext, input: String): PageRankGraph = {
      val start_time = System.nanoTime()
      val current_tread = Thread.currentThread.getName

      log_print("STARTING GRAPH BUILDER...", current_tread)
      log_print("[GRAPH BUILDER] - Reading data from: " + input, current_tread)

      // read the data from input file discarding the first line
      val allEdges = sc.textFile(input).mapPartitionsWithIndex {
         (idx, iter) => if (idx == 0) iter.drop(1) else iter // deletes the first row (header)
      }.map { row => row.split(",") }
         .map { cols =>
            ((
               cols(3).replaceAll("\"", "").toInt, // start station
               cols(5).replaceAll("\"", "").toInt // end station
            ), 1)
         }

      // create weighted edges discarding self link
      val weightedEdges = allEdges
         .filter(row => row._1._1 != row._1._2) // deletes self link
         .reduceByKey((x, y) => x + y)
         .map {
            case ((src, dst), weigth) => SimpleEdge(src, dst, weigth)
         }

      val edges = normalizeOutEdgeWeights(weightedEdges)

      val output = fromEdgesToGraph(edges)

      log_print(s"GRAPH BUILT! > Elapsed time: ${(System.nanoTime - start_time) / 1000000000f}s", current_tread)
      log_print("Nodes: " + output.numVertices + ", Links: " + output.edges.count(), Thread.currentThread().getName)

      output
   }

   /*
    * Normalizes the out edges in a way that the sum of the weights for each node is 1.
    * Return an RDD with edges and their normal and normalized weight values
    */
   def normalizeOutEdgeWeights(edges: SimpleEdgeRDD): EdgeRDD = {
      val sums = edges
         .map {
            edge => (edge.srcId, edge.weight)
         }.reduceByKey(_ + _)

      edges
         .map { case SimpleEdge(srcId, dstId, weight) =>
            (srcId, (dstId, weight))
         }
         //(_.toOutSimpleEdgePair)
         .join(sums)
         .map { case (srcId, (outEdge, weightSum)) =>
            Edge(srcId, outEdge._1, outEdge._2, outEdge._2 / weightSum)
         }.persist()
   }

   /*
    * Takes all the edges, finds the vertices without outlinks and attaches the initial PR value
    */
   def fromEdgesToGraph(edges: EdgeRDD): PageRankGraph = {
      val srcIds = edges.map(edge => edge.srcId).distinct
      val dstIds = edges.map(edge => edge.dstId).distinct

      val allIds = (srcIds ++ dstIds).distinct()

      val numVertices = allIds.count()

      //initial rank value (1/numVertices) attached to all vertices
      val initialPRValue = 1.0 / numVertices
      val vertices = allIds.map(id => (id, initialPRValue))

      val dangles = findDanglingVertices(srcIds, dstIds)

      val finalEdges = edges
         .map(_.toOutEdgePair)
         .persist()

      edges.unpersist()

      val finalVertices = vertices
         .join(dangles)
         .map {
            case (id, (value, isDangling)) =>
               (id, DataVertex(value, isDangling))
         }
         .persist()

      PageRankGraph(numVertices, finalVertices, finalEdges)
   }

   /*
    * Checks if vertices have or not outgoing edges
    */
   def findDanglingVertices(srcIds: RDD[Id], dstIds: RDD[Id]): RDD[(Id, Boolean)] = {
      val srcIdsPairs = srcIds.map(id => (id, 1))
      val dstIdsPairs = dstIds.map(id => (id, 1))

      // The fullOuterJoin assures you consider all the vertices
      val verticesInOutEdge = srcIdsPairs.fullOuterJoin(dstIdsPairs)

      verticesInOutEdge.map {
         case (id, vals) =>
            (id, vals._1.isEmpty) //if the first component of the tuple is empty this means that is a vertex with only inlinks
      }
   }
}
