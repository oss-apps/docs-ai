import { ConvoRating } from "@prisma/client";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import { summarizeConversation } from "~/server/docGPT";
import { getHistoryForConvo } from "./docGPT";



export const conversationRouter = createTRPCRouter({
  getConversations: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string() }))
    .query(async ({ input, ctx }) => {
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          id: 'desc',
        },
        take: 10,
      })
      return {
        conversations,
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
    const messages = await getHistoryForConvo(input.convoId)
    const { SUMMARY } = await summarizeConversation(messages) as { SUMMARY: string }

    const conversation = await ctx.prisma.conversation.update({
      where: {
        id: input.convoId,
      },
      data: {
        summary: SUMMARY,
      }
    })
    return {
      conversation,
      summary: SUMMARY,
    };
  }),
});
