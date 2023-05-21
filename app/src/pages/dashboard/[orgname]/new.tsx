import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import Image from "next/image";
import Nav from "~/containers/Nav/Nav";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type OrgUser, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import { Input, Label } from "~/components/form/input";
import PrimaryButton from "~/components/form/button";
import { api } from "~/utils/api";
import { type FieldValues, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import Snackbar from "~/components/SnackBar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import NavBack from "~/components/NavBack";
import { IconAdd, IconNewProject } from "~/components/icons/icons";


const projectSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional()
})


const NewProject: NextPage<{ user: User, orgJson: string }> = ({ orgJson }) => {
  const router = useRouter()

  const org: (OrgUser & {
    org: Org
  }) = superjson.parse(orgJson)

  const createProject = api.project.createProject.useMutation()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema) });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, description } = data as any as z.input<typeof projectSchema>
    const { project } = await createProject.mutateAsync({ name, description, orgId: org.org.id })
    await router.push(`/dashboard/${org.org.name}/${project.slug}`)
  };


  return (
    <div className="h-full">
      <Head>
        <title> New Project</title>
      </Head>
      <Nav />
      <main>
        <div className="max-w-2xl mx-auto mt-5">
          <NavBack href="/dashboard" ></NavBack>
          <p className="flex justify-center gap-3 items-center text-4xl mt-10">
            <IconNewProject className="h-10 w-10" />  New project
          </p>
          <div className="max-w-2xl mx-auto mt-10 ">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Label>Project name</Label>
              <Input
                error={errors.name?.message?.toString()}
                placeholder="Support"
                {...register('name', { required: 'Project name is required', minLength: 3, maxLength: 50 })}
              />

              <Label className="mt-6">Description</Label>
              <Input
                error={errors.description?.message?.toString()}
                placeholder="Knowledge base for support"
                {...register('description')}
              />

              <PrimaryButton disabled={createProject.isLoading} loading={createProject.isLoading} className="mx-auto mt-6 flex gap-2">
                <IconAdd className="w-5 h-5" />  Create
              </PrimaryButton>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/'
      }
    }
  }

  const orgname = context.query.orgname as string

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname
      }
    },
    include: {
      org: true
    }
  })

  if (!org) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  const props = { props: { user: session.user, orgJson: org ? superjson.stringify(org) : null } }
  return props
}

export default NewProject;