import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import Head from "next/head";
import { env } from "~/env.mjs";
import { useRouter } from "next/router";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <meta property="og:title" content="DocsAI" />
        <meta name="description" content="Create AI support agent with your documents." />
        <meta property="og:image" content="https://docsai.app/images/app.png" />

        <meta property="twitter:title" content="DocsAI" />
        <meta property="twitter:description" content="Create AI support agent with your documents." />
        <meta property="twitter:image" content="https://docsai.app/images/app.png" />
        <link rel="icon" href="/images/favicon.ico" />
        <script src="https://beamanalytics.b-cdn.net/beam.min.js" data-token="494f02eb-86bc-460d-ac63-db4d351eea9c" async></script>
        {!router.route.startsWith("/embed") ? (
          <script src="/embed.js" project-id="clfp5tn2a0007mc0ub8qch4x2" primary-color="#000" async></script>
        ) : null}
      </Head>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
