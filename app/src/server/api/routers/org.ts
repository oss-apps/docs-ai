import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  orgMemberProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { createCustomer, stripe } from "~/server/stripe";
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

      try {

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
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new TRPCError({ message: 'This name already been used', code: 'BAD_REQUEST' });
        }

        else throw e
      }
    }),
  createCheckoutSession: orgMemberProcedure
    .input(z.object({ orgId: z.string(), price: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let org = await ctx.prisma.org.findUnique({ where: { id: input.orgId } })
      if (!org?.stripeCustomerId) {
        org = await createCustomer(input.orgId)
      }

      if (org.stripeCustomerId) {
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: org.stripeCustomerId,
          allow_promotion_codes: true,
          line_items: [
            {
              price: input.price,
              quantity: 1,
            }
          ],
          success_url: `${env.NEXTAUTH_URL}/dashboard/${org.name}/subscription`,
          cancel_url: `${env.NEXTAUTH_URL}/dashboard/${org.name}/subscription`,
        })

        return session
      }
    }),
  createManageSession: orgMemberProcedure
    .input(z.object({ orgId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const org = await ctx.prisma.org.findUnique({ where: { id: input.orgId } })
      if (org?.stripeCustomerId) {
        const session = await stripe.billingPortal.sessions.create({
          customer: org.stripeCustomerId,
          return_url: `${env.NEXTAUTH_URL}/dashboard/${org.name}/subscription`,
        })

        return session
      }
    })
});
