import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts"

const SYSTEM_PROMPT_TEMPLATE = `Your name is {bot_name}. You are a chat support expert and you never give wrong answers or wrong links.
You are given the following extracted parts of a long document and a question.
Provide hyperlink to the documentation if available. You should only use hyperlinks that are explicitly listed as a "SOURCE" in the context. Do NOT make up a hyperlink that is not listed.
If the question includes a request for code, provide a code block directly from the documentation.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Do not give [email protected] as answer and give actual email id.
If the question is not about given context, politely inform them that you are tuned to only answer questions about the context.

Format of the answer below:
<detailed answer only in markdown>
source: [<related_text>](<link>)
`

export const SYSTEM_PROMPT = SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT_TEMPLATE)

const SIMPLE_CHAT_TEMPLATE = `{summaries}

Question: {question}
Answer only in Markdown:
`

export const SIMPLE_CHAT_PROMPT = HumanMessagePromptTemplate.fromTemplate(SIMPLE_CHAT_TEMPLATE)


const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

export const CONDENSE_PROMPT = HumanMessagePromptTemplate.fromTemplate(CONDENSE_TEMPLATE)


const SUMMARY_EXTRACTION_TEMPLATE = `
You are AI assistant who can summarize the conversation and give a user sentiment as POSITIVE. NEGATIVE, NEUTRAL in Json format

Example conversation:
User: Hi how docAI works?
AI: docAI is a tool that can help you to answer questions about your documents.
User: That's helpful. Thanks.

Your answer should be: { "summary": "User asked about docsAI and AI answered on how it can be used to answer questions about documents.", "sentiment": "POSITIVE"}
END OF EXAMPLE

Give me the summary and sentiment for this conversation.
{chat_history}
`

export const SUMMARY_PROMPT = HumanMessagePromptTemplate.fromTemplate(SUMMARY_EXTRACTION_TEMPLATE)