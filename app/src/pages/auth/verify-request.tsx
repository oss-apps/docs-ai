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
import Footer from "~/containers/Footer";
import { IconEmailDC } from "~/components/icons/icons";

const signInSchema = z.object({
  email: z.string(),
})

const SignIn: NextPage<{ providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> }> = ({ providers }) => {
  const { register, handleSubmit, formState: { errors }, getValues } = useForm({ resolver: zodResolver(signInSchema) });

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
        <link rel="icon" href="/images/favicon.ico" />
      </Head>
      <HomeNav />
      <main className="mx-auto  max-w-xl pb-32 px-4 lg:px-0 mt-20 h-[60vh]">
        <div className="border shadow-md p-4 border-zinc-400 rounded-lg">
          <p className="text-center text-2xl font-semibold">Verification email sent</p>
          <div className="text-center flex justify-center my-4">
            <IconEmailDC className="w-16 h-16" />
          </div>

          <p className="text-center text-slate-600">Just one more step to go! Click the verification link in your email.</p>
        </div>
      </main>
      <Footer />
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

