import { type NextPage } from "next";
import Head from "next/head";
import HomeNav from "~/containers/Nav/HomeNav";

const Terms: NextPage = () => {

  return (
    <>
      <Head>
        <title>Docs AI</title>
        <meta name="description" content="Create an AI support agent with your documents." />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <div>
        <HomeNav />
        <main className="mx-auto max-w-4xl pb-32 px-4 lg:px-0">
          <h1 className="text-2xl font-semibold mt-20">Terms of service</h1>
          <p className="text-sm text-zinc-600">
            Last Updated: 22 Apr, 2023
          </p>

          <p className="text-xl font-semibold mt-12">
            1. Agreement
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            By using DocsAI, you agree to these Terms of Service. DocsAI reserves the right to modify these Terms at any time. By continuing to use the Service, you agree to the updated Terms.
          </p>

          <p className="text-xl font-semibold mt-12">
            2. Eligibility
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            You must be at least 13 years old to use the Service. By using the Service, you represent that you meet this age requirement.
          </p>

          <p className="text-xl font-semibold mt-12">
            3. Acceptable Use
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            You agree not to use the Service for any illegal or harmful activities. We reserve the right to terminate your access to the Service if you violate this provision.
          </p>

          <p className="text-xl font-semibold mt-12">
            4. Termination
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, for any reason.
          </p>

          <p className="text-xl font-semibold mt-12">
            5. Disclaimers and Limitation of Liability
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            The Service is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of any kind. We disclaim all liability for any damages or losses arising from your use of the Service.
          </p>

          <p className="text-xl font-semibold mt-12">
            6. Governing Law
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            These Terms shall be governed by the laws of US. Any disputes arising from these Terms shall be resolved in the courts located in US.
          </p>

          <p className="text-xl font-semibold mt-12">
            7. Privacy
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            Please read our <a href="/privacy">Privacy Policy</a>
          </p>

          <p className="text-xl font-semibold mt-12">
            8. Contact
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            If you have any questions or concerns regarding these Terms, please contact us at hey@docsai.app.
          </p>

        </main>
        <footer className="mx-auto  max-w-6xl pb-32">
          <p className="text-center text-lg text-gray-500">contact: hey@docsai.app</p>
          <p className="mt-4 text-center text-zinc-500">Made with ❤️ by <a className="text-zinc-900 hover:underline underline-offset-2" href="https://twitter.com/KM_Koushik_" target="_blank" rel="noreferrer">Koushik</a></p>
        </footer>
      </div >

    </>
  );
};

export default Terms;