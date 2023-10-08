import { Plan, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import { isAbovePro } from "~/utils/license";
import slugify from "~/utils/slugify";
import crypto from "crypto";



export const projectRouter = createTRPCRouter({
  createProject: orgMemberProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const projects = await ctx.prisma.project.findMany({ where: { orgId: input.orgId } })
        if ((projects.length >= 1 && ctx.org?.plan === Plan.FREE) || (projects.length >= 2 && ctx.org?.plan === Plan.BASIC) || (projects.length >= 5 && ctx.org?.plan === Plan.PROFESSIONAL)) {
          throw new TRPCError({ message: 'You have reached the limit of projects for your plan', code: 'BAD_REQUEST' });
        }
        const result = await ctx.prisma.project.create({
          data: {
            ...input,
            slug: slugify(input.name),
          }
        })
        return {
          project: result,
        };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new TRPCError({ message: 'This project already exist', code: 'BAD_REQUEST' });
        }

        else throw e
      }
    }),

  updateProject: orgMemberProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      orgId: z.string(),
      projectId: z.string(),
      generateSummary: z.boolean().optional(),
      defaultPrompt: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.prisma.project.update({
          where: {
            id: input.projectId
          },
          data: {
            name: input.name,
            description: input.description,
            defaultPrompt: input.defaultPrompt,
            generateSummary: isAbovePro(ctx.org) && !!input.generateSummary
          }
        })
        return {
          project: result,
        };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new TRPCError({ message: 'This project already exist', code: 'BAD_REQUEST' });
        }

        else throw e
      }
    }),

  updateBotSettings: orgMemberProcedure
    .input(z.object({
      defaultQuestion: z.string().optional(),
      projectId: z.string(),
      botName: z.string().min(3),
      initialQuestion: z.string().min(3),
      primaryColor: z.string().min(4),
      supportEmail: z.string().email().optional().nullable(),
      askUserId: z.string().optional().nullable(),

    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.prisma.project.update({
          where: {
            id: input.projectId
          },
          data: {
            defaultQuestion: input.defaultQuestion,
            botName: input.botName,
            initialQuestion: input.initialQuestion,
            primaryColor: input.primaryColor,
            supportEmail: input.supportEmail,
            askUserId: input.askUserId
          }
        })
        return {
          project: result,
        };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new TRPCError({ message: 'This project already exist', code: 'BAD_REQUEST' });
        }

        else throw e
      }
    }),

  createOrRecreateApiKey: orgMemberProcedure.
    input(z.object({ projectId: z.string(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.project) {
        const apiKey = crypto.randomBytes(16).toString('hex');

        await ctx.prisma.projectToken.upsert({
          where: {
            projectId: input.projectId
          },
          create: {
            projectId: input.projectId,
            projectApiKey: apiKey,
          },
          update: {
            projectApiKey: apiKey,
          },
        })

        return { apiKey }
      } else throw new TRPCError({ message: 'Project not found', code: 'NOT_FOUND' });
    }),
  dashboardData: orgMemberProcedure
    .input(z.object({ orgId: z.string(), projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      const weeklyConversations = await ctx.prisma.conversation.groupBy({
        by: ['rating'],
        where: {
          projectId: input.projectId,
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        },
        _count: {
          rating: true,
        }
      })

      const weeklyCount = weeklyConversations.reduce((acc, c) => acc + c._count.rating, 0)

      const monthlyConversations = await ctx.prisma.conversation.groupBy({
        by: ['rating'],
        where: {
          projectId: input.projectId,
          createdAt: {
            gte: new Date(new Date().setDate(0))
          }
        },
        _count: {
          rating: true,
        }
      })

      const monthlyConversationCount = monthlyConversations.reduce((acc, c) => acc + c._count.rating, 0)

      return { weeklyConversations, monthlyConversations, weeklyCount, monthlyConversationCount }
    }),
});
