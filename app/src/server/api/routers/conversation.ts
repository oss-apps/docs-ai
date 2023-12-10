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

type convoFilter = {
  filter?: {
    from?: Date | null;
    to?: Date | null;
    rating?: string | null;
    feedback?: 'POSITIVE' | 'NEGATIVE' | 'ALL' | 'NO FILTER' | string
  };
  orgId?: string;
  projectId?: string;
}

const zConvoFilter = z.object({ from: z.date().optional().nullable(), to: z.date().optional().nullable(), rating: z.string().nullable().default('ALL'), feedback: z.string().default('NO FILTER') }).optional()


export const conversationRouter = createTRPCRouter({
  getConversations: orgMemberProcedure
    .input(z.object({
      projectId: z.string(), orgId: z.string(), cursor: z.string().nullish(),
      filter: zConvoFilter
    }))
    .query(async ({ input, ctx }) => {
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          ...getConvoFilter({ projectId: input.projectId, filter: input.filter }),
          messages: {
            ...getMessageFilter({ filter: input.filter })
          }
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
  getConversation: publicProcedure
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
          messages: {
            orderBy: {
              createdAt: 'asc',
            }
          },
        }
      })

      return {
        conversation,
      };
    }),

  getConversationById: publicProcedure
    .input(z.object({ convoId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (input.convoId === 'new') {
        return {
          conversation: null,
        }
      }
      const conversation = await ctx.prisma.conversation.findFirst({
        where: {
          id: input.convoId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            }
          },
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
  clearChatHistory: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.conversation.deleteMany({
        where: {
          projectId: input.projectId,
        }
      })
    }),

  clearConversation: orgMemberProcedure
    .input(z.object({ projectId: z.string(), id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.conversation.deleteMany({
        where: {
          projectId: input.projectId,
          id: input.id
        }
      })
    }),  
  downloadConversations: orgMemberProcedure
    .input(z.object({ projectId: z.string(), orgId: z.string(), filter: zConvoFilter }))
    .query(async ({ input, ctx }) => {
      const conversations = await ctx.prisma.conversation.findMany({
        where: {
          ...getConvoFilter({ projectId: input.projectId, filter: input.filter }),
          messages: {
            ...getMessageFilter({ filter: input.filter })
          }
        },
        select: {
          summary: true, createdAt: true, projectId: true, rating: true, id: true,
          messages: {
            select: { message: true, user: true, id: true, createdAt: true, sources: true, feedback: true },
            orderBy: { createdAt: 'asc' }
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      return conversations
    })
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

const getConvoFilter = (filterObj: convoFilter) => {
  const filter = {
    ...(filterObj.projectId ? { projectId: filterObj.projectId } : {}),
    ...(filterObj?.filter?.from && filterObj?.filter?.to ? {
      createdAt: {
        lte: filterObj.filter.to.toISOString(),
        gte: filterObj.filter.from.toISOString()
      }
    } : {}),
    ...((filterObj?.filter?.rating && filterObj.filter.rating != 'ALL') ? { rating: filterObj.filter.rating as ConvoRating } : {})
  }

  return filter
}

const getMessageFilter = (filter: convoFilter) => {
  const filterObj = filter?.filter
  if (!filterObj?.feedback) return {}
  const filterr = {
    ...(filterObj.feedback == 'NO FILTER' ? {} : {
      some: {
        feedback: {
          ...(filterObj.feedback == 'POSITIVE' ? { equals: true } :
            filterObj.feedback == 'NEGATIVE' ? { equals: false } : { not: null })
        }
      }
    })
  }
  return filterr

}