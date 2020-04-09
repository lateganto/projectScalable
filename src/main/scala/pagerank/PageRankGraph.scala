package pagerank

final case class PageRankGraph(numVertices: Id, vertices: RichVertexPairRDD, edges: OutEdgePairRDD) {



   def printOutAll = {
      println("vertices are:")
      vertices.take(20).foreach(println)
      //      println(s"${vertices.collect().mkString(",")}")

      println("\nedges are:")
//      edges.collect().foreach(println)
      //      println(s"${edges.collect().mkString(",")}")
   }

}
