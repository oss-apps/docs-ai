import { type Conversation, ConvoRating } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { DEFAULT_PROMPT } from "~/server/constants";
import { prisma } from "~/server/db";
// import * as docGPT from "~/server/docGPT";
import * as docgpt from "~/server/docgpt/index";
import { type ChatCallback } from "~/types";

export const docGPTRouter = createTRPCRouter({
  getAnswer: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), saveConvo: z.boolean().optional(), convoId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.projectId } });
      const result = await docgpt.getChat(input.orgId, input.projectId, input.question, [], project?.botName || '', project?.defaultPrompt);

      const convo = input.saveConvo ?
        await createOrUpdateNewConversation(input.orgId, input.projectId, input.question, result.answer, result.tokens, result.limitReached, null, input.convoId, result.sources) : null

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
      return await getAnswerFromProject(input.orgId, input.projectId, input.question, project.botName, input.convoId, undefined, project.defaultPrompt)
    }),
  getPublicChatbotAnswer: publicProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), question: z.string(), convoId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.prisma.project.findUnique({ where: { id: input.projectId } });
      if (!project || !project.public) {
        throw new TRPCError({ message: 'Project not found or not public', code: 'BAD_REQUEST' });
      }
      const chatHistory = input.convoId ? await getHistoryForConvo(input.convoId) : []
      const result = await docgpt.getChat(input.orgId, input.projectId, input.question, chatHistory, project.botName, project.defaultPrompt)
      const convo = await createOrUpdateNewConversation(input.orgId, input.projectId, input.question, result.answer, result.tokens, result.limitReached, null, input.convoId, result.sources)
      return {
        conversation: convo,
      };
    }),
  updateMessageFeedback: publicProcedure
    .input(z.object({ id: z.string(), feedback: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const feedbackRes = await ctx.prisma.messages.update({
        where: {
          id: input.id
        },
        data: {
          feedback: input.feedback
        }
      })
      return feedbackRes.feedback
    }),
  updateUserIdAndCustomFields: publicProcedure
    .input(z.object({ userId: z.string(), convoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const convo = await ctx.prisma.conversation.update({
        where: {
          id: input.convoId
        },
        data: {
          userId: input.userId
        }
      })
    })

});

export const getAnswerFromProject = async (orgId: string, projectId: string, question: string, botName: string, convoId?: string, cb?: ChatCallback, prompt = DEFAULT_PROMPT, userId: string | null = null) => {
  const chatHistory = convoId ? await getHistoryForConvo(convoId) : []

  const result = await docgpt.getChat(orgId, projectId, question, chatHistory, botName, prompt, cb)

  const convo = await createOrUpdateNewConversation(orgId, projectId, question, result.answer, result.tokens, result.limitReached, userId, convoId, result.sources)

  return {
    ...result,
    conversationId: convo?.id,
  };
}

export const createOrUpdateNewConversation = async (orgId: string, projectId: string, question: string, answer: string, tokens: number, limitReached: boolean, userId: string | null, convoId?: string, sources?: string) => {
  let conversation: Conversation;
  const now = new Date();
  const currentDateISO = now.toISOString();
  const nextDateIso = new Date(now.getTime() + 1000).toISOString();

  if (convoId) {
    await prisma.messages.createMany({
      data: [{
        convoId,
        user: 'user',
        message: question,
        createdAt: currentDateISO
      }, {
        convoId,
        user: 'assistant',
        message: answer,
        sources,
        createdAt: nextDateIso
      }]
    })

    conversation = await prisma.conversation.update({
      where: { id: convoId },
      data: {
        userId: userId,
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
            createdAt: currentDateISO
          }, {
            user: 'assistant',
            message: answer,
            sources,
            createdAt: nextDateIso
          }]
        },
        userId: userId
      },
      include: {
        messages: true,
      }
    })
  }

  if (!limitReached) {
    const p1 = prisma.project.update({
      where: { id: projectId },
      data: {
        tokensUsed: {
          increment: tokens,
        },
        chatUsed: {
          increment: 1,
        }
      }
    })

    const p2 = prisma.org.update({
      where: { id: orgId },
      data: {
        chatCredits: {
          decrement: 1,
        },
      }
    })

    await Promise.all([p1, p2])
  }


  return await prisma.conversation.findUnique({ where: { id: conversation.id }, include: { messages: true } })
}

export const getHistoryForConvo = async (convoId: string) => {
  const messages = await prisma.messages.findMany({
    where: {
      convoId,
    }, 
    orderBy : {
      createdAt: 'asc'
    }
  })

  return messages.map(m => ({ role: m.user, content: m.message }))
}
