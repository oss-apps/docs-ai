import { Conversation, ConvoRating } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import * as docGPT from "~/server/docGPT";

export const docGPTRouter = createTRPCRouter({
  getAnswer: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), saveConvo: z.boolean().optional(), convoId: z.string().optional() }))
    .query(async ({ input }) => {
      const result = await docGPT.getGPTAnswer(input.projectId, input.question) as { answer: string, tokens: number };
      
      const convo = input.saveConvo ? await createOrUpdateNewConversation(input.projectId, input.question, result.answer, result.tokens, input.convoId) : null

      return {
        ...result,
        conversationId: convo?.id,
      };
    }),
  getPublicAnswer: publicProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), convoId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.projectId } });
      if (!project || !project.public) {
        throw new TRPCError({ message: 'Project not found or not public', code: 'BAD_REQUEST' });
      }
      const result = await docGPT.getGPTAnswer(input.projectId, input.question) as { answer: string, tokens: number };
      const convo = await createOrUpdateNewConversation(input.projectId, input.question, result.answer, result.tokens, input.convoId)
      return {
        ...result,
        conversationId: convo?.id,
      };
    }),
  getPublicChatbotAnswer: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), convoId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.projectId } });
      if (!project || !project.public) {
        throw new TRPCError({ message: 'Project not found or not public', code: 'BAD_REQUEST' });
      }
      const chatHistory = input.convoId ? await getHistoryForConvo(input.convoId) : []
      const result = await docGPT.getGPTChat(input.projectId, input.question, chatHistory) as { answer: string, tokens: number };
      const convo = await createOrUpdateNewConversation(input.projectId, input.question, result.answer, result.tokens, input.convoId)
      return {
        conversation: convo,
      };
    }),
});

export const createOrUpdateNewConversation = async (projectId: string, question: string, answer: string, tokens: number, convoId?: string) => {
  let conversation: Conversation
  if (convoId) {
    await prisma.messages.createMany({
      data: [{
        convoId,
        user: 'user',
        message: question,
      }, {
        convoId,
        user: 'assistant',
        message: answer,
      }]
    })

    conversation = await prisma.conversation.update({
      where: { id: convoId },
      data: {
        tokensUsed: {
          increment: tokens
        }
      },
      include: {
        messages: true
      }
    })

  } else {
    conversation = await prisma.conversation.create({
      data: {
        projectId,
        rating: ConvoRating.NEUTRAL,
        firstMsg: question,
        tokensUsed: tokens,
        messages: {
          create: [{
            user: 'user',
            message: question,
          }, {
            user: 'assistant',
            message: answer,
          }]
        }
      },
      include: {
        messages: true,
      }
    })
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      tokensUsed: {
        increment: tokens
      }
    }
  })

  return await prisma.conversation.findUnique({ where: { id: conversation.id }, include: { messages: true }})
}

export const getHistoryForConvo = async (convoId: string) => {
  const messages = await prisma.messages.findMany({
    where: {
      convoId,
    }
  })

  return messages.map(m => ({ role: m.user, content: m.message }))
}