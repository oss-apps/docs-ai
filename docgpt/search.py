from langchain.embeddings import HuggingFaceEmbeddings, OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains.question_answering import load_qa_chain
from langchain import LLMChain
from langchain.llms import OpenAIChat
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.qa_with_sources.map_reduce_prompt import (
    EXAMPLE_PROMPT,
)
from .prompt_templates.chat_template import SYSTEM_PROMPT, SIMPLE_CHAT_PROMPT, SUMMARY_EXTRACTION_PROMPT, CONDENSE_QUESTION_PROMPT, QA_PROMPT
from langchain.vectorstores import Milvus
import os

embeddings = HuggingFaceEmbeddings()
if os.getenv("ENV") == "prod":
    embeddings = OpenAIEmbeddings()

prefix_messages = [
    {"role": "system", "content": SYSTEM_PROMPT.partial(bot_name="Jarvis").format()}]

def get_vector_db(procject_id: str):
    vector_db = NotImplemented
    if os.getenv("ENV") == "prod":
        vector_db =  Milvus(
            embedding_function= embeddings,
            collection_name= procject_id,
            text_field= "text",
            connection_args= {
                "uri": os.getenv("MILVUS_URI"),
                "user": os.getenv("MILVUS_USER"),
                "password": os.getenv("MILVUS_PASSWORD"),
                "secure": True
            })
    else:
        vector_db = Chroma(persist_directory='db',
                       embedding_function=embeddings, collection_name=project_id)
    
    return vector_db




def get_answer_for_query(project_id: str, query: str):
    vector_db = get_vector_db(project_id)
    docs = vector_db.similarity_search(query, 4)

    llm = OpenAIChat(temperature=0)
    chain = load_qa_chain(llm, chain_type="stuff",
                          prompt=QA_PROMPT.partial(bot_name="Jarvis"))

    result = chain(
        {"input_documents": docs, "question": query}, return_only_outputs=False
    )
    print(result)
    print("running query against Q&A chain.\n")
    answer = result["output_text"]

    return answer


def get_standalone_question(chat_history, question):
    if len(chat_history) == 0:
        return question
    llm = OpenAIChat(temperature=0)
    llm_chain = LLMChain(
        llm=llm, prompt=CONDENSE_QUESTION_PROMPT, output_key="output_text")
    history_str = ""
    for chat in chat_history:
        history_str += chat["role"] + ":" + chat["content"] + "\n"
    new_question = llm_chain.run(
        {"question": question, "chat_history": history_str})

    return new_question


def get_answer_for_chat(project_id: str, query: str, chat_history):
    consolidated_question = get_standalone_question(chat_history, query)
    vector_db = get_vector_db(project_id)

    print("Question: ", consolidated_question)
    docs = []
    try:
        docs = vector_db.similarity_search(
            consolidated_question, 2, {"type": "TEXT"})
    except:
        print("No TEXT data found")

    docs = docs + \
        vector_db.similarity_search(consolidated_question, 2, {"type": "URL"})

    llm = OpenAIChat(
        temperature=0, prefix_messages=prefix_messages + chat_history)

    llm_chain = LLMChain(
        llm=llm, prompt=SIMPLE_CHAT_PROMPT,
    )

    # To get document with source links
    chain = StuffDocumentsChain(
        llm_chain=llm_chain,
        document_variable_name="summaries",
        document_prompt=EXAMPLE_PROMPT,
    )

    result = chain(
        {"input_documents": docs, "question": query}, return_only_outputs=False
    )
    print("running query against Q&A chain.\n")
    answer = result["output_text"]

    return answer


def summarize_chat(chat_history: str):
    llm = OpenAIChat(temperature=0)

    llm_chain = LLMChain(
        llm=llm, prompt=SUMMARY_EXTRACTION_PROMPT, output_key="output_text"
    )

    result = llm_chain(
        {"chat_history": chat_history}, return_only_outputs=False
    )
    print("running summary chain")
    answer = result["output_text"]

    return answer
