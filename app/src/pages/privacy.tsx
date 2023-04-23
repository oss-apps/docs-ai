import { type NextPage } from "next";
import Head from "next/head";
import Footer from "~/containers/Footer";
import HomeNav from "~/containers/Nav/HomeNav";

const Privacy: NextPage = () => {

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
          <h1 className="text-2xl font-semibold mt-20">Privacy Policy</h1>
          <p className="text-sm text-zinc-600">
            Last Updated: 22 Apr, 2023
          </p>

          <p className="mt-4 text-lg text-zinc-600">
            DocsAI is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and disclose your information when you use DocsAI.
          </p>

          <p className="text-xl font-semibold mt-16">
            Information We Collect
          </p>
          <p className="text-lg mt-4 text-zinc-700">Personal Information</p>
          <p className="text-lg mt-0.5 text-zinc-600">
            When you create an account, we collect your email address, name.
          </p>
          <p className="text-lg mt-4 text-zinc-700">Usage Data</p>
          <p className="text-lg mt-0.5 text-zinc-600">
            We automatically collect information about how you interact with the Service, such as pages visited and features used.
          </p>

          <p className="text-xl font-semibold mt-16">
            How We Use Your Information
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            We use your information for the following purposes:

            <ul className="list-disc list-inside">
              <li>To provide and maintain the Service</li>
              <li>To improve and personalize your experience with the Service</li>
              <li>To communicate with you about updates, promotions, and customer support</li>
            </ul>
          </p>
          <p className="text-xl font-semibold mt-16">
            Sharing Your Information
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            We do not sell, rent, or share your personal information with third parties.
          </p>
          <p className="text-xl font-semibold mt-16">
            4. Data Security
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            We take reasonable steps to protect your information from unauthorized access, use, or disclosure. However, no method of transmission or storage is completely secure, and we cannot guarantee the absolute security of your information.
          </p>

          <p className="text-xl font-semibold mt-16">
            5. Data Retention
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            We retain your personal information for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements.
          </p>

          <p className="text-xl font-semibold mt-16">
            6. Your Rights
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            You may access, update, or request the deletion of your personal information by contacting us at hey@docsai.app.
          </p>

          <p className="text-xl font-semibold mt-16">
            7. Children&apos;s Privacy
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            The Service is not intended for users under 13 years old. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at [Your Support Email].
          </p>
          <p className="text-xl font-semibold mt-16">
            8. Changes to This Policy
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            We may update this Policy from time to time. We will notify you of any changes by posting the updated Policy on this page. By continuing to use the Service, you agree to be bound by the updated Policy.
          </p>
          <p className="text-xl font-semibold mt-16">
            9. Contact
          </p>
          <p className="text-lg mt-1 text-zinc-600">
            If you have any questions or concerns regarding these Terms, please contact us at hey@docsai.app.
          </p>

        </main>
        <Footer />
      </div >

    </>
  );
};

export default Privacy;