import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  orgMemberProcedure,
} from "~/server/api/trpc";
import slugify from "~/utils/slugify";



export const projectRouter = createTRPCRouter({
  createProject: orgMemberProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.prisma.project.create({
          data: {
            ...input,
            slug: slugify(input.name),
          }
        })
        return {
          project: result,
        };
      } catch(e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new TRPCError({ message: 'This project already exist', code: 'BAD_REQUEST' });
        }

        else throw e
      }
    }),
  updateProject: orgMemberProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), defaultQuestion: z.string().optional(), orgId: z.string(), projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.prisma.project.update({
          where: {
            id: input.projectId
          },
          data: {
            name: input.name,
            description: input.description,
            defaultQuestion: input.defaultQuestion
          }
        })
        return {
          project: result,
        };
      } catch(e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new TRPCError({ message: 'This project already exist', code: 'BAD_REQUEST' });
        }

        else throw e
      }
    }),
});
