import { ConvoRating } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
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
      console.log(ratings, ratingData)

      return {
        ratings: ratingData,
        total: ratingData.NEGATIVE + ratingData.NEUTRAL + ratingData[ConvoRating.POSITIVE]
      };
    }),
  getConversation: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), convoId: z.string() }))
    .query(async ({ input, ctx }) => {
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
  summarizeConversation: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), convoId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.org || !ctx.project) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not a member of this organization" });
      }

      if (ctx.org.chatCredits < 1 || !ctx.project.generateSummary) return

      const messages = await getHistoryForConvo(input.convoId)
      const { summary, sentiment, tokens } = await docgpt.getSummary(messages)

      const conversation = await ctx.prisma.conversation.update({
        where: {
          id: input.convoId,
        },
        data: {
          summary,
          rating: sentiment,
        }
      })

      const p1 = ctx.prisma.project.update({
        where: { id: input.projectId },
        data: {
          tokensUsed: {
            increment: tokens
          }
        }
      })

      const p2 = ctx.prisma.org.update({
        where: { id: input.orgId },
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
      };
    }),
});
