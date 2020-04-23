
import org.apache.spark.rdd.RDD

package object pagerank {
   type Id = Long
   type Value = Double

   type OutEdgePair = (Id, OutEdge)
   type VertexPair = (Id, Value)
   type RichVertexPair = (Id, DataVertex)

   type OutEdgePairRDD = RDD[OutEdgePair]
   type RichVertexPairRDD = RDD[RichVertexPair]


   type EdgeRDD = RDD[Edge]
   type VertexRDD = RDD[Vertex]

   final case class Vertex(id: Id, value: Value)

   final case class Edge(srcId: Id, dstId: Id, weight: Value) {
      def toOutEdgePair: OutEdgePair = (srcId, OutEdge(dstId, weight))
   }

   final case class OutEdge(dstId: Id, weight: Value)

   final case class DataVertex(value: Value, isDangling: Boolean) {
      /**
       * Copies the vertex properties but provides a new value.
       */
      def setNewValue(newValue: Value): DataVertex =
         DataVertex(newValue, isDangling)
   }

}