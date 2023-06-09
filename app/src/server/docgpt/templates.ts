import { HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "langchain/prompts"

const SYSTEM_PROMPT_TEMPLATE = `
`

export const SYSTEM_PROMPT = SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT_TEMPLATE)

const SIMPLE_CHAT_TEMPLATE = `
Your name is {bot_name}. You are a chat support expert and you never make answers up.
{prompt}

{summaries}

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
You are AI assistant who can summarize the conversation and give a user sentiment as POSITIVE. NEGATIVE in Json format

Example conversation:
User: Hi how docAI works?
AI: docAI is a tool that can help you to answer questions about your documents.
User: That's helpful. Thanks.

Your answer should be: {answer}
END OF EXAMPLE

Give me the summary and sentiment for this conversation.
{chat_history}
`

export const SUMMARY_ANSWER = '{ "summary": "User asked about docsAI and AI answered on how it can be used to answer questions about documents.", "sentiment": "POSITIVE"}'

export const SUMMARY_PROMPT = HumanMessagePromptTemplate.fromTemplate(SUMMARY_EXTRACTION_TEMPLATE)