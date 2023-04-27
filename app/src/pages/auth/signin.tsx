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
import { useState } from "react";
import Footer from "~/containers/Footer";

const signInSchema = z.object({
  email: z.string(),
})

const SignIn: NextPage<{ providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> }> = ({ providers }) => {
  const [signInLaoding, setSignInLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(signInSchema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { email } = data as z.input<typeof signInSchema>
    setSignInLoading(true)
    try {
      await signIn('email', { email })
    } catch (e) {
      console.log(e)
      setSignInLoading(false)
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
        <div className="flex justify-center flex-col">
          {Object.values(providers).map((provider) => provider.type !== 'email' ? (
            <div key={provider.name} className="mx-auto">
              <button onClick={() => signIn(provider.id)} className="mx-auto w-[300px] border border-zinc-700 p-2 px-4 rounded-md hover:bg-zinc-100 flex items-center justify-center">
                <Image alt="Google logo" loading="lazy" height="15" width="15" id="provider-logo-dark" src="https://authjs.dev/img/providers/google.svg" />
                <p className="ml-4">
                  Continue with {provider.name}
                </p>
              </button>
            </div>
          ) : null)}
          <div className="border-t border-zinc-200 w-[300px] mx-auto mt-7 pb-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Label className="mt-6">Email</Label>
              <Input
                error={errors.email?.message?.toString()}
                placeholder="name@domain.com"
                {...register('email', { required: 'Email is required' })}
              />
              <PrimaryButton disabled={signInLaoding} loading={signInLaoding} type="submit" className="mx-auto mt-2 w-[300px]">Create</PrimaryButton>
            </form>
          </div>
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

