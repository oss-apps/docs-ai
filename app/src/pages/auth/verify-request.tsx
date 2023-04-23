import { type GetServerSidePropsContext, type NextPage } from "next";
import Head from "next/head";
import Pricing from "~/containers/Pricing";
import HomeNav from "~/containers/Nav/HomeNav";
import { getProviders, signIn, type ClientSafeProvider, type LiteralUnion } from "next-auth/react";
import { type BuiltInProviderType } from "next-auth/providers";
import PrimaryButton from "~/components/form/button";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";
import { Input, Label } from "~/components/form/input";
import { z } from "zod";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
  email: z.string(),
})

const SignIn: NextPage<{ providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> }> = ({ providers }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(signInSchema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { email } = data as z.input<typeof signInSchema>

    try {
      await signIn('email', { email })
    } catch (e) {
      console.log(e)
    }
  };



  return (
    <>
      <Head>
        <title>Docs AI</title>
        <meta name="description" content="Create an AI support agent with your documents." />
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <HomeNav />
      <main className="mx-auto  max-w-xl pb-32 px-4 lg:px-0 mt-20 h-[60vh]">
        <div className="border p-4 border-zinc-400 rounded-md">
          <p className="text-center text-xl font-semibold">Verification Email sent</p>
          <div className="text-center flex justify-center mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>


          <p className="text-center mt-10">Please click the link sent to your email</p>
        </div>
      </main>

      <footer className="mx-auto  max-w-6xl pb-32">
        <p className="text-center text-lg text-gray-500">contact: hey@docsai.app</p>

        <p className="mt-4 text-center text-zinc-500">Made with ❤️ by <a className="text-zinc-900 hover:underline underline-offset-2" href="https://twitter.com/KM_Koushik_" target="_blank" rel="noreferrer">Koushik</a></p>
      </footer>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders()
  const session = await getServerAuthSession(context)
  if (session) {
    return {
      redirect: {
        destination: '/dashboard'
      }
    }
  }
  return {
    props: { providers },
  }
}

export default SignIn;

