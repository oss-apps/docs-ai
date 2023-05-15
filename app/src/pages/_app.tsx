import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import "~/styles/globals.scss";
import Head from "next/head";
import { env } from "~/env.mjs";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";



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
        {!router.route.startsWith("/embed") && env.NEXT_PUBLIC_NODE_ENV === "production" ? (
          <script src="/embed.min.js" project-id="clfp5tn2a0007mc0ub8qch4x2" primary-color="#000" async></script>
        ) : !router.route.startsWith("/embed") && env.NEXT_PUBLIC_NODE_ENV !== "production" ? (
          <script src="/embed.js" project-id="clhljr3og0009u1sstmk8r2ro" docs-url="http://localhost:3000" async></script>
        ) : null}
      </Head>
      <Toaster position="bottom-center" />
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
