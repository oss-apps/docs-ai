/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type ConvoRating, MessageUser, Plan, DocumentType } from "@prisma/client"
import { getVectorDB } from "./store"
import { ChatOpenAI } from "langchain/chat_models";
import { SIMPLE_CHAT_PROMPT, CONDENSE_PROMPT, SUMMARY_PROMPT, SUMMARY_ANSWER } from "./templates";
import { StuffDocumentsChain } from "./chains/combineDocumentChain";
import { Tiktoken } from "@dqbd/tiktoken/lite";
import cl100k_base from "@dqbd/tiktoken/encoders/cl100k_base.json";
import { AIChatMessage, HumanChatMessage } from "langchain/schema";
import { prisma } from "../db";
import { checkAndUpdateFreeAccount } from "../stripe";


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

const getChatHistoryStr = (chatHistory: Array<{ role: MessageUser, content: string }>) => {
  let history = ``
  for (const message of chatHistory) {
    history = `${history}\n ${message.role}:${message.content}`
  }

  return history
}

export const getStandaloneQuestion = async (chatHistory: Array<{ role: MessageUser, content: string }>, question: string) => {
  if (chatHistory.length === 0) return { question, tokens: 0 }

  const chat = new ChatOpenAI({ temperature: 0 });
  const history = getChatHistoryStr(chatHistory)
  const prompt = (await CONDENSE_PROMPT.format({ question, chat_history: history })).text

  const result = await chat.call([new HumanChatMessage(prompt)])

  const { inputTokens, outputTokens } = getTokens('', prompt, result.text);
  return { question: result.text, tokens: inputTokens + outputTokens }
}

export const getChat = async (orgId: string, projectId: string, question: string, chatHistory: Array<{ role: MessageUser, content: string }>, botName: string) => {
  const org = await prisma.org.findUnique({ where: { id: orgId } })
  const vectorDb = await getVectorDB(projectId)

  if (org && org?.chatCredits < 1) {
    if (org.plan === Plan.FREE || org.plan === Plan.BASIC) {
      if (org.plan === Plan.FREE) await checkAndUpdateFreeAccount(org)
      console.log("Search only mode is not possible for free or basic plans")
      return { tokens: 0, answer: 'Sorry limit reached. Contact owner of the site', sources: '', limitReached: true }
    }
    else {
      const documents = await vectorDb.similaritySearch(question, 4, { projectId })
      const answer = documents.map(d => d.pageContent).join('\n')
      const sources = documents.reduce((acc, d) => {
        acc[d.metadata.source as string] = true
        return acc
      }, {} as Record<string, boolean>)

      return { tokens: 0, answer, sources: Object.keys(sources).join(','), limitReached: true }
    }
  }

  const { question: stdQuestion, tokens: stdTokens } = await getStandaloneQuestion(chatHistory, question)

  const documents = await vectorDb.similaritySearch(stdQuestion, 4, { projectId })

  documents.map(d => console.log(d.pageContent))

  const history = chatHistory.map(({ role, content }) => {
    if (role === MessageUser.user) {
      return new HumanChatMessage(content);
    } else {
      return new AIChatMessage(content);
    }
  })

  // const callbackManager = CallbackManager.fromHandlers({
  //   handleLLMNewToken(token: string) {
  //     console.log("token", { token });

  //     return Promise.resolve();
  //   },
  // });

  const chat = new ChatOpenAI({ temperature: 0, streaming: true });
  const chain = new StuffDocumentsChain({ documentVariableName: 'summaries' });
  const { summaries } = await chain.call({ input_documents: documents, question: stdQuestion }) as { summaries: string }

  const questionPrompt = (await SIMPLE_CHAT_PROMPT.format({ question: stdQuestion, summaries, bot_name: botName })).text;

  const result = await chat.call([...history, new HumanChatMessage(questionPrompt)])
  const { inputTokens, outputTokens } = getTokens('', questionPrompt, result.text);

  const sources = documents.reduce((acc, d) => {
    if (d.metadata.type === DocumentType.URL) acc[d.metadata.source as string] = true

    return acc
  }, {} as Record<string, boolean>)

  return { tokens: inputTokens + outputTokens + stdTokens, answer: result.text, sources: Object.keys(sources).join(','), limitReached: false }
}


export const getSummary = async (chatHistory: Array<{ role: MessageUser, content: string }>) => {
  const history = getChatHistoryStr(chatHistory)

  const chat = new ChatOpenAI({ temperature: 0, streaming: true });
  const questionPrompt = (await SUMMARY_PROMPT.format({ chat_history: history, answer: SUMMARY_ANSWER })).text;

  const result = await chat.call([new HumanChatMessage(questionPrompt)])
  const { inputTokens, outputTokens } = getTokens('', questionPrompt, result.text);

  const resultJson = JSON.parse(result.text) as { summary: string, sentiment: ConvoRating }

  return { ...resultJson, tokens: inputTokens + outputTokens }
}

