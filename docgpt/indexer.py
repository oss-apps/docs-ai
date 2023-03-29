from langchain.embeddings import HuggingFaceEmbeddings, OpenAIEmbeddings
from langchain.vectorstores import Chroma
from loader import load_document, load_text_document
from vectorstores.docs_milvus import DocsMilvus
import requests
import os


embeddings = HuggingFaceEmbeddings()
if os.getenv("ENV") == "prod":
    embeddings = OpenAIEmbeddings()


def index_url_document(url: str, type: str, project_id: str, document_id: str, webhook_url: str, load_all_paths: bool, skip_paths: str):
    docs = load_document(url, type, document_id, load_all_paths, skip_paths)
    db = index_documents(docs, project_id)
    # Make a request to webhook_url
    title = docs[0].metadata["title"]
    send_msg_to_app(webhook_url, title, document_id)

    return db


def index_text_document(content: str, title: str, project_id: str, document_id: str, webhook_url: str):
    docs = load_text_document(content, title, document_id)
    db = index_documents(docs, project_id)
    send_msg_to_app(webhook_url, title, document_id)

    return db


def index_documents(docs, project_id):
    if os.getenv("ENV") == "prod":
        metadatas = []
        texts = []
        for d in docs:
            metadatas.append(d.metadata)
            texts.append(d.page_content)
        db = DocsMilvus.create_collection(
            collection_name=project_id,
            embedding=embeddings,
            metadatas=metadatas,
            connection_args={
                "uri": os.getenv("MILVUS_URI"),
                "user": os.getenv("MILVUS_USER"),
                "password": os.getenv("MILVUS_PASSWORD"),
                "secure": True
            })
        db.add_texts(texts=texts, metadatas=metadatas)
    else:
        Chroma.from_documents(docs, embeddings, persist_directory='db', collection_name=project_id)


def send_msg_to_app(url: str, title: str, document_id: str):
    print(url)
    rq = requests.post(url, json={
                       "title": title, "documentId": document_id})
    print("DocsAI webhooks called with status code:", rq.status_code)
