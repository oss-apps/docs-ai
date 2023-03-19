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
      const result = await ctx.prisma.project.create({
        data: {
          ...input,
          slug: slugify(input.name),
        }
      })
      return {
        project: result,
      };
    }),
});
