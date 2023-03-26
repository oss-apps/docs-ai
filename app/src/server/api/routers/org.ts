import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import slugify from "~/utils/slugify";



export const orgRouter = createTRPCRouter({
  createOrg: protectedProcedure
    .input(z.object({ name: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id
        }
      })

      if (!user?.approved) {
        throw new TRPCError({ message: 'User still in waiting list', code: 'BAD_REQUEST' });
      }

      const result = await ctx.prisma.org.create({
        data: {
          name: slugify(input.name),
          displayName: input.name,
          orgUsers: {
            create: {
              userId: user.id
            }
          }
        }
      })
      return {
        org: result,
      };
    }),
});
