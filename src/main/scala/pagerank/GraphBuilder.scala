package pagerank

import org.apache.spark.SparkContext
import org.apache.spark.rdd.RDD


object GraphBuilder {

   def buildGraph(sc: SparkContext, input: String): PageRankGraph = {

      // read the data from input file discarding the first line
      val allEdges = sc.textFile(input).mapPartitionsWithIndex {
         (idx, iter) => if (idx == 0) iter.drop(1) else iter
      }.map { row => row.split(",") }
         .map { cols =>
            ((cols(3).replaceAll("\"", "").toInt,
               cols(5).replaceAll("\"", "").toInt),
               1)
         }

      // create weighted edges discarding self link
      val weightedEdges = allEdges
         .filter(row => row._1._1 != row._1._2) // deletes self link
         .reduceByKey((x, y) => x + y)
         .map {
            case ((x, y), z) => Edge(x, y, z)
         }

      val edges = normalizeOutEdgeWeights(weightedEdges)

      fromEdgesToGraph(edges)
   }

   /*
    * Normalizes the out edges in a way that the sum of the weights for each node is 1
    */
   def normalizeOutEdgeWeights(edges: EdgeRDD): EdgeRDD = {
      val sums = edges
         .map {
            edge => (edge.srcId, edge.weight)
         }.reduceByKey(_ + _)

      edges
         .map(_.toOutEdgePair)
         .join(sums)
         .map { case (srcId, (outEdge, weightSum)) =>
            Edge(srcId, outEdge.dstId, outEdge.weight / weightSum)
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

      val finalVertices = vertices
         .join(dangles)
         .map {
            case (id, (value, isDangling)) =>
               (id, VertexData(value, isDangling))
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
