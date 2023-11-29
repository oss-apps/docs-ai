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
import SetUserInWindow from "~/components/SetUserInWindow";



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const showChatBotIcon = !(router.route.startsWith("/embed") || router.route.startsWith("/chat"))

  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <meta property="og:title" content="The AI Companion you always wanted" />
        <meta name="description" content="Train your documents, chat with your documents, and create chatbots that solves queries for you and your users." />
        <meta property="og:image" content="https://docsai.app/images/og-app.jpeg" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:width" content="1200" />
        <meta property="twitter:title" content="The AI Companion you always wanted" />
        <meta property="og:url" content="https://docsai.app"></meta>
        <meta property="twitter:description" content="Train your documents, chat with your documents, and create chatbots that solves queries for you and your users." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content="https://docsai.app/images/og-app.jpeg" />
        <meta property="og:type" content="website"></meta>
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {env.NEXT_PUBLIC_NODE_ENV === "production" && 
          <script src="https://beamanalytics.b-cdn.net/beam.min.js" data-token="494f02eb-86bc-460d-ac63-db4d351eea9c" async></script>
        }

        {showChatBotIcon && env.NEXT_PUBLIC_NODE_ENV === "production" ? (
          <script src="/embed.min.js" project-id="clfp5tn2a0007mc0ub8qch4x2" primary-color="#000" async></script>
        ) : showChatBotIcon && env.NEXT_PUBLIC_NODE_ENV !== "production" ? (
            <script src="/embed.js" project-id="clol3x1k500011jufu8a73eha" docs-url="http://localhost:3000" async></script>
        ) : null}
      </Head>
      <Toaster position="bottom-center" />
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <SetUserInWindow />
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
