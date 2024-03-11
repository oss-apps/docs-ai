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
import { PagesProgressBar as ProgressBar } from 'next-nprogress-bar';



const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();
  const showChatBotIcon = !(router.route.startsWith("/embed") || router.route.startsWith("/chat"))

  return (
    <>
      <Head>
        <link rel="icon" href="/images/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {env.NEXT_PUBLIC_NODE_ENV === "production" && 
          <script src="https://beamanalytics.b-cdn.net/beam.min.js" data-token="494f02eb-86bc-460d-ac63-db4d351eea9c" async></script>
        }

        {showChatBotIcon && env.NEXT_PUBLIC_NODE_ENV === "production" ? (
          <script src="/embed.min.js" project-id="clfp5tn2a0007mc0ub8qch4x2" version-number="2" async></script>
        ) : showChatBotIcon && env.NEXT_PUBLIC_NODE_ENV !== "production" ? (
            <script src="/embed.js" project-id="clt05df0g00041j59rfn6w117" version-number="2" docs-url="http://localhost:3000" async></script>
        ) : null}
      </Head>
      <Toaster position="bottom-center" />
      <SessionProvider session={session}>
        <Component {...pageProps} />
        <ProgressBar
          height="3px"
          color="#0c0a09"
          delay={200}
          options={{ showSpinner: true }}
          shallowRouting
        />
        <SetUserInWindow />
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
