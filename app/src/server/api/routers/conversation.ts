import { ConvoRating, type Org, type Project } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import * as docgpt from '~/server/docgpt/index'
import { getHistoryForConvo } from "./docGPT";


export const conversationRouter = createTRPCRouter({
  getConversations: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), cursor: z.string().nullish() }))
    .query(async ({ input, ctx }) => {
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          id: 'desc',
        },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        take: 11,
      })

      let nextCursor: string | undefined = undefined;
      if (conversations.length > 10) {
        const nextItem = conversations.pop()
        nextCursor = nextItem!.id
      }
      return {
        conversations,
        nextCursor,
      };
    }),
  getConversationRatings: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const ratings = await ctx.prisma.conversation.groupBy({
        by: ['rating'],
        where: {
          projectId: input.projectId,
        },
        _count: {
          rating: true,
        }
      })

      const ratingData = { [ConvoRating.POSITIVE]: 0, [ConvoRating.NEUTRAL]: 0, [ConvoRating.NEGATIVE]: 0 }

      for (const r of ratings) {
        ratingData[r.rating] = r._count.rating
      }

      return {
        ratings: ratingData,
        total: ratingData.NEGATIVE + ratingData.NEUTRAL + ratingData[ConvoRating.POSITIVE]
      };
    }),
  getConversation: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), convoId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (input.convoId === 'new') {
        return {
          conversation: null,
        }
      }
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.convoId,
          projectId: input.projectId,
        },
        include: {
          messages: true,
        }
      })

      return {
        conversation,
      };
    }),
  summarizeConversation: publicProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), convoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.org || !ctx.project) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not a member of this organization" });
      }

      return summarizeConversation(ctx.org, ctx.project, input.convoId)
    }),
});

export const summarizeConversation = async (org: Org, project: Project, convoId: string) => {
  if (org.chatCredits < 1 || !project.generateSummary) return

  const messages = await getHistoryForConvo(convoId)
  const { summary, sentiment } = await docgpt.getSummary(messages)

  const conversation = await prisma.conversation.update({
    where: {
      id: convoId,
    },
    data: {
      summary,
      rating: sentiment,
    }
  })

  const p1 = prisma.project.update({
    where: { id: project.id },
    data: {
      chatUsed: {
        increment: 1
      }
    }
  })

  const p2 = prisma.org.update({
    where: { id: org.id },
    data: {
      chatCredits: {
        decrement: 1
      }
    }
  })

  await Promise.all([p1, p2])

  return {
    conversation,
    summary,
  }
}