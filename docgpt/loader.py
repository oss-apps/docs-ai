from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import WebBaseLoader, TextLoader
from transformers import BertTokenizer
from langchain.docstore.document import Document
from document_loaders.docusaurus import DocusaurusLoader
from document_loaders.documentation import DocumentationLoader
from document_loaders.gitbook import GitbookLoader
import os

tokenizer = BertTokenizer.from_pretrained(
    "sentence-transformers/all-MiniLM-L6-v2")

URL_LOADER = {
    "gitbook": GitbookLoader,
    "docusaurus": DocusaurusLoader,
    "documentation": DocumentationLoader
}


def get_url_loader(url: str, type: str, load_all_paths: bool, skip_paths: str = None):
    Loader = URL_LOADER.get(type, WebBaseLoader)

    loader = Loader(url)
    if hasattr(loader, 'load_all_paths'):
        loader.load_all_paths = load_all_paths
    if hasattr(loader, 'skip_paths'):
        loader.skip_paths = skip_paths
    return loader

def get_text_splitter():
    text_splitter = RecursiveCharacterTextSplitter.from_huggingface_tokenizer(tokenizer=tokenizer,
                                                                              chunk_size=500, chunk_overlap=50)
    if os.getenv("ENV") == "prod":
        text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=500, chunk_overlap=50)

    return text_splitter

def load_document(url: str, type, document_id: str, load_all_paths=True, skip_paths: str = None):
    loader = get_url_loader(url, type, load_all_paths, skip_paths)
    all_pages_data = loader.load()
    for doc in all_pages_data:
        doc.metadata["document_id"] = document_id
        doc.metadata["type"] = "URL"
    text_splitter = get_text_splitter()
    docs = text_splitter.split_documents(all_pages_data)
    print("Loaded", len(docs), "docs")
    return docs


def load_text_document(content: str, title: str, document_id: str):
    metadata = {"source": "manual", "document_id": document_id,
                "title": title, "type": "TEXT"}
    data = [Document(page_content=title+"\n"+content, metadata=metadata)]
    text_splitter = get_text_splitter()

    docs = text_splitter.split_documents(data)
    return docs
