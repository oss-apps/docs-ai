/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MessageUser } from "@prisma/client"
import { getVectorDB } from "./store"
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models";
import { SYSTEM_PROMPT, SIMPLE_CHAT_PROMPT } from "./templates";
import { StuffDocumentsChain } from "./chains/combineDocumentChain";
import { Tiktoken } from "@dqbd/tiktoken/lite";
import cl100k_base from "@dqbd/tiktoken/encoders/cl100k_base.json";
import { CallbackManager } from "langchain/callbacks";
import { AIChatMessage, HumanChatMessage, SystemChatMessage } from "langchain/schema";


const getTokens = (systemPrompt: string, questionPrompt: string, answer: string) => {
  const encoding = new Tiktoken(
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str
  );
  const inputTokens = encoding.encode(systemPrompt + questionPrompt);
  const outputTokens = encoding.encode(answer);

  return { inputTokens: inputTokens.length, outputTokens: outputTokens.length };
}


export async function getChat(projectId: string, question: string, chatHistory: Array<{ role: MessageUser, content: string }>, botName: string) {
  const vectorDb = await getVectorDB()
  const documents = await vectorDb.similaritySearch(question, 4, { projectId })

  const history = chatHistory.map(({ role, content }) => {
    if (role === MessageUser.user) {
      return new HumanChatMessage(content);
    } else {
      return new AIChatMessage(content);
    }
  })

  // const callbackManager = CallbackManager.fromHandlers({
  //   handleLLMNewToken(token: string) {
  //     // console.log("token", { token });

  //     return Promise.resolve();
  //   },
  // });

  const chat = new ChatOpenAI({ temperature: 0, streaming: true });
  const chain = new StuffDocumentsChain({ documentVariableName: 'summaries' });

  const { summaries } = await chain.call({ input_documents: documents, question: question }) as { summaries: string }

  const systemPrompt = (await SYSTEM_PROMPT.format({ bot_name: botName })).text;
  const questionPrompt = (await SIMPLE_CHAT_PROMPT.format({ question, summaries })).text;

  const result = await chat.call([new SystemChatMessage(systemPrompt), ...history, new HumanChatMessage(questionPrompt)])
  const { inputTokens, outputTokens } = getTokens(systemPrompt, questionPrompt, result.text);

  return { tokens: inputTokens + outputTokens, answer: result.text }
}