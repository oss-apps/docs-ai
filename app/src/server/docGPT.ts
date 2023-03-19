import { type MessageUser } from '@prisma/client';
import fetch from 'node-fetch';
import { env } from "~/env.mjs";

const webhookUrl = `${env.NEXTAUTH_URL}/api/webhook/docgpt`

export async function getGPTAnswer(projectId: string, question: string) {
  console.log("getGPTAnswer", projectId, question, env.DOC_GPT_SERVICE_URL, env.DOC_GPT_SECRET, `${env.DOC_GPT_SERVICE_URL}/qna`)
  const response = await fetch(`${env.DOC_GPT_SERVICE_URL}/qna`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DOC_GPT_SECRET}`,
    },
    body: JSON.stringify({  projectId, question }),
  })

return response.json()
}

export async function getGPTChat(projectId: string, question: string, chatHistory: Array<{ role: MessageUser, content: string }>) {
  const response = await fetch(`${env.DOC_GPT_SERVICE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DOC_GPT_SECRET}`,
    },
    body: JSON.stringify({  projectId, question, chatHistory }),
  })

  return response.json()
}


export async function indexUrlDocument(url: string, type: string, projectId: string, documentId: string) {

  const response = await fetch(`${env.DOC_GPT_SERVICE_URL}/index_url_document`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DOC_GPT_SECRET}`,
    },
    body: JSON.stringify({ url, type, projectId, documentId, webhookUrl }),
  })
  
  return response.json()
}

export async function indexTextDocument(content: string, title: string, projectId: string, documentId: string) {
  const response = await fetch(`${env.DOC_GPT_SERVICE_URL}/index_text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DOC_GPT_SECRET}`,
    },
    body: JSON.stringify({ content, title, projectId, documentId, webhookUrl }),
  })
  
  return response.json()
}

export async function summarizeConversation(chatHistory: Array<{ role: MessageUser, content: string }>) {
  const response = await fetch(`${env.DOC_GPT_SERVICE_URL}/summarize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.DOC_GPT_SECRET}`,
    },
    body: JSON.stringify({ chatHistory }),
  })

  return response.json()
}