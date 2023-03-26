from typing import Any, Iterable, List, Optional, Tuple

from langchain.vectorstores import Milvus
from langchain.docstore.document import Document
from langchain.embeddings.base import Embeddings
from langchain.vectorstores.base import VectorStore

class DocsMilvus:

    @classmethod
    def create_collection(
        cls,
        collection_name: str,
        embedding: Embeddings,
        metadatas: Optional[List[dict]] = None,
        **kwargs: Any,
    ) -> Milvus:
        """Create a Milvus collection, indexes it with HNSW, and insert data.

        Args:
            texts (List[str]): Text to insert.
            embedding (Embeddings): Embedding function to use.
            metadatas (Optional[List[dict]], optional): Dict metatadata.
                Defaults to None.

        Returns:
            VectorStore: The Milvus vector store.
        """
        try:
            from pymilvus import (
                Collection,
                CollectionSchema,
                DataType,
                FieldSchema,
                connections,
            )
            from pymilvus.orm.types import infer_dtype_bydata
        except ImportError:
            raise ValueError(
                "Could not import pymilvus python package. "
                "Please install it with `pip install pymilvus`."
            )
        # Connect to Milvus instance
        if not connections.has_connection("default"):
            connections.connect(**kwargs.get("connection_args", {"port": 19530}))
        # Determine embedding dim
        embeddings = embedding.embed_query("hello")
        dim = len(embeddings)
        # Generate unique names
        primary_field = "primary_key"
        vector_field = "vector"
        text_field = "text"
        collection_name = collection_name
        fields = []
        # Determine metadata schema
        

        fields.append(FieldSchema("source", DataType.VARCHAR, max_length=2048))
        fields.append(FieldSchema("title", DataType.VARCHAR, max_length=2048))
        fields.append(FieldSchema("document_id", DataType.VARCHAR, max_length=30))
        fields.append(FieldSchema("type", DataType.VARCHAR, max_length=20))
        # Create the text field
        fields.append(
            FieldSchema(text_field, DataType.VARCHAR, max_length=65535)
        )
        # Create the primary key field
        fields.append(
            FieldSchema(primary_field, DataType.INT64, is_primary=True, auto_id=True)
        )
        # Create the vector field
        fields.append(FieldSchema(vector_field, DataType.FLOAT_VECTOR, dim=dim))
        # Create the schema for the collection
        schema = CollectionSchema(fields)
        # Create the collection
        collection = Collection(collection_name, schema)
        # Index parameters for the collection
        index = {
            "index_type": "AUTOINDEX",
            "metric_type": "L2",
            "params": {"M": 8, "efConstruction": 64},
        }
        # Create the index
        if not collection.has_index(index_name=vector_field):
            collection.create_index(vector_field, index)
        # Create the VectorStore
        milvus = Milvus(
            embedding,
            kwargs.get("connection_args", {"port": 19530}),
            collection_name,
            text_field,
        )

        return milvus