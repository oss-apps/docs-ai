import { type Conversation, ConvoRating } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
// import * as docGPT from "~/server/docGPT";
import * as docgpt from "~/server/docgpt/index";

export const docGPTRouter = createTRPCRouter({
  getAnswer: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), saveConvo: z.boolean().optional(), convoId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.projectId } });
      const result = await docgpt.getChat(input.projectId, input.question, [], project?.botName || '');

      const convo = input.saveConvo ? await createOrUpdateNewConversation(input.projectId, input.question, result.answer, result.tokens, input.convoId, result.sources) : null

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
      return await getAnswerFromProject(input.projectId, input.question, project.botName, input.convoId)
    }),
  getPublicChatbotAnswer: publicProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), convoId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.projectId } });
      if (!project || !project.public) {
        throw new TRPCError({ message: 'Project not found or not public', code: 'BAD_REQUEST' });
      }
      const chatHistory = input.convoId ? await getHistoryForConvo(input.convoId) : []
      const result = await docgpt.getChat(input.projectId, input.question, chatHistory, project.botName)
      const convo = await createOrUpdateNewConversation(input.projectId, input.question, result.answer, result.tokens, input.convoId, result.sources)
      return {
        conversation: convo,
      };
    }),
});

export const getAnswerFromProject = async (projectId: string, question: string, botName: string, convoId?: string) => {
  const result = await docgpt.getChat(projectId, question, [], botName)

  const convo = await createOrUpdateNewConversation(projectId, question, result.answer, result.tokens, convoId, result.sources)

  return {
    ...result,
    conversationId: convo?.id,
  };
}

export const createOrUpdateNewConversation = async (projectId: string, question: string, answer: string, tokens: number, convoId?: string, sources?: string) => {
  let conversation: Conversation;
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
        sources,
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
            sources,
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

  return await prisma.conversation.findUnique({ where: { id: conversation.id }, include: { messages: true } })
}

export const getHistoryForConvo = async (convoId: string) => {
  const messages = await prisma.messages.findMany({
    where: {
      convoId,
    }
  })

  return messages.map(m => ({ role: m.user, content: m.message }))
}