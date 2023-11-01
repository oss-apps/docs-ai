import { z } from "zod";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string().min(1) : z.string().url(),
  ),
  // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  DOC_GPT_SECRET: z.string().min(1),
  DOC_GPT_SERVICE_URL: z.string().url(),
  SLACK_SIGINING_SECRET: z.string(),
  SLACK_CLIENT_ID: z.string(),
  SLACK_CLIENT_SECRET: z.string(),
  OPENAI_API_KEY: z.string(),
  PINECONE_API_KEY: z.string(),
  PINECONE_ENVIRONMENT: z.string(),
  PINECONE_INDEX: z.string(),
  STRIPE_API_KEY: z.string(),
  STRIPE_SECRET: z.string(),
  SENDGRID_API_KEY: z.string(),
  R2_ACCESS_KEY: z.string(),
  R2_SECRET_KEY: z.string(),
  R2_DOCS_BUCKET: z.string(),
  NOTION_CLIENT_SECRET: z.string(),
  NOTION_REDIRECT_URL: z.string()
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_NOTION_CLIENT_ID: z.string(),
  NEXT_PUBLIC_NOTION_AUTHORIZATION_URL: z.string()
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  // Public Envs
  NEXT_PUBLIC_NOTION_CLIENT_ID: process.env.NEXT_PUBLIC_NOTION_CLIENT_ID,
  NEXT_PUBLIC_NOTION_AUTHORIZATION_URL: process.env.NEXT_PUBLIC_NOTION_AUTHORIZATION_URL,
  NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,

  // Server Envs
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  DOC_GPT_SECRET: process.env.DOC_GPT_SECRET,
  DOC_GPT_SERVICE_URL: process.env.DOC_GPT_SERVICE_URL,
  SLACK_SIGINING_SECRET: process.env.SLACK_SIGINING_SECRET,
  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
  PINECONE_INDEX: process.env.PINECONE_INDEX,
  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  STRIPE_SECRET: process.env.STRIPE_SECRET,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  R2_ACCESS_KEY: process.env.R2_ACCESS_KEY,
  R2_SECRET_KEY: process.env.R2_SECRET_KEY,
  R2_DOCS_BUCKET: process.env.R2_DOCS_BUCKET,
  NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET,
  NOTION_REDIRECT_URL: process.env.NOTION_REDIRECT_URL

};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
