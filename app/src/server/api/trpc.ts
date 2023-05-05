/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";

import { getServerAuthSession } from "~/server/auth";
import { prisma } from "~/server/db";

type CreateContextOptions = {
  session: Session | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  const org: Org | null = null;
  const project: Project | null = null;

  return {
    session: opts.session,
    prisma,
    org,
    project,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Project, type Org } from "@prisma/client";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/** Reusable middleware adds project and org to the context. */
const setProjectAndOrg = t.middleware(async ({ ctx, next, rawInput }) => {
  const orgId = (rawInput as Record<"orgId", string>).orgId
  const projectId = (rawInput as Record<"projectId", string>).projectId

  const org = orgId ? await ctx.prisma.org.findUnique({ where: { id: orgId } }) : null
  const project = projectId ? await ctx.prisma.project.findUnique({ where: { id: projectId } }) : null

  return next({
    ctx: { ...ctx, org, project },
  });
});


const loggerMiddleware = t.middleware(async (opts) => {
  const start = Date.now();

  const result = await opts.next({ ctx: opts.ctx });

  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  result.ok
    ? console.log('OK request timing:', meta)
    : console.error('Non-OK request timing', meta);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(loggerMiddleware).use(setProjectAndOrg);

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next, rawInput }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const orgId = (rawInput as Record<"orgId", string>).orgId
  const projectId = (rawInput as Record<"projectId", string>).projectId

  const org = orgId ? await ctx.prisma.org.findUnique({ where: { id: orgId } }) : null
  const project = projectId ? await ctx.prisma.project.findUnique({ where: { id: projectId } }) : null
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
      project,
      org,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(loggerMiddleware).use(enforceUserIsAuthed);

/**
 * Prevent non-organization members from accessing the proceduce
 */
export const orgMemberProcedure = protectedProcedure.use(async ({ ctx, next, rawInput }) => {
  const orgId = (rawInput as Record<"orgId", string>).orgId
  const orgUser = await ctx.prisma.orgUser.findFirst({
    where: {
      userId: ctx.session.user.id,
      orgId,
    },
  })

  if (!orgUser) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not a member of this organization" });
  }

  return next({ ctx: { ...ctx, } });
})