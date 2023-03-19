"""Load text content."""
from typing import List

from langchain.docstore.document import Document
from langchain.document_loaders.base import BaseLoader


class TextContentLoader(BaseLoader):
    """Load text files."""

    def __init__(self, content: str, source: str):
        """Initialize with file path."""
        self.content = content
        self.source = source

    def load(self) -> List[Document]:
        """Load from file path."""

        metadata = {"source": self.source}
        return [Document(page_content=self.content, metadata=metadata)]
