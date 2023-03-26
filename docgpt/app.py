from dotenv import load_dotenv
from flask import Flask, request
import threading
import time
from indexer import index_url_document, index_text_document
from search import get_answer_for_query, get_answer_for_chat, summarize_chat

print(__name__)

app = Flask(__name__)

load_dotenv()

print("Starting DocGPT service")


@app.route("/")
def hello_world():
    return "<p>Welcome to docGPT service</p>"


def index_document_fake(url, project_id):
    print("Indexing document")
    time.sleep(20)
    print("Done indexing document")


@app.route("/index_url_document", methods=['POST'])
def index_url():
    request_data = request.get_json()
    print(request_data.get('url'))

    thread = threading.Thread(target=index_url_document, args=(
        request_data.get('url'),
        request_data.get('type'),
        request_data.get('projectId'),
        request_data.get('documentId'),
        request_data.get('webhookUrl')))
    thread.start()

    return {"message": "Success"}


@app.route("/index_text", methods=['POST'])
def index_text():
    request_data = request.get_json()

    thread = threading.Thread(target=index_text_document, args=(
        request_data.get('content'),
        request_data.get('title'),
        request_data.get('projectId'),
        request_data.get('documentId'),
        request_data.get('webhookUrl')))
    thread.start()

    return {"message": "Success"}


@app.route("/qna", methods=['POST'])
def query():
    req_data = request.get_json()
    result = get_answer_for_query(
        req_data.get('projectId'), req_data.get('question'))
    return result


@app.route("/chat", methods=['POST'])
def chat():
    req_data = request.get_json()
    result = get_answer_for_chat(
        req_data.get('projectId'), req_data.get('question'), req_data.get('chatHistory'))
    return result


@app.route("/summarize", methods=['POST'])
def summarize():
    req_data = request.get_json()
    answer = summarize_chat(req_data.get('chatHistory'))
    return answer
