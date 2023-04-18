import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { Input, Label } from "~/components/form/input";
import PrimaryButton from "~/components/form/button";
import { z } from "zod";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import Snackbar from "~/components/SnackBar";
import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { isAbovePro } from "~/utils/license";


const projectSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
  defaultQuestion: z.string(),
  botName: z.string(),
})


const SettingsPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [showSuccess, setShowSuccess] = useState(false)

  const org: Org = superjson.parse(orgJson)
  const project: Project & {
    slackInstalation: {
      id: string;
      teamName: string;
    } | null
  } = superjson.parse(projectJson)

  const [generateSummary, setGenerateSummary] = useState(project.generateSummary)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(projectSchema) });

  const updateProject = api.project.updateProject.useMutation()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, description, defaultQuestion, botName } = data as any as z.input<typeof projectSchema>
    await updateProject.mutateAsync({ name, description, orgId: org.id, projectId: project.id, defaultQuestion, botName, generateSummary })
  };

  useEffect(() => {
    setShowSuccess(updateProject.isSuccess)
  }, [updateProject.isSuccess])

  return (
    <>
      <Head>
        <title>Docs AI - Dashboard</title>
        <meta name="description" content="Create chat bot with your documents in 5 minutes" />
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full">
            <div className="mt-10 p-5 px-10">
              <div className="max-w-5xl mx-auto">
                <div>
                  <p className="text-gray-800 text-lg">Integrations</p>
                  <div className="mt-4 border-t" />
                  <div className="mt-4 flex p-4 bg-gray-100 rounded-md items-center justify-between">
                    {project.slackInstalation ? (
                      <div>
                        Slack connected with the workspace <span className="bg-orange-100 text-orange-500 p-1 rounded">{project.slackInstalation.teamName}</span>
                      </div>
                    ) : (
                      <>
                        <p>Connect slack to ask questions in your channels</p>
                        <a href={`https://slack.com/oauth/v2/authorize?client_id=5026673231779.5023868711141&scope=app_mentions:read,chat:write,commands&state=${project.id}`}>
                          <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                        </a>
                      </>
                    )}
                  </div>
                  <div className="mt-10">
                    <p className="text-gray-800 text-lg">Project settings</p>
                    <div className="mt-4 border-t" />
                    <div className="w-1/2">
                      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 p-4 rounded-md">
                        <div className="w-full mt-4">
                          <Label>Name</Label>
                          <Input
                            defaultValue={project.name}
                            placeholder="A good name"
                            {...register('name')}
                            error={errors.name?.message?.toString()}
                          />
                        </div>
                        <div className="w-full mt-4">
                          <Label>Bot Name</Label>
                          <Input
                            defaultValue={project.botName}
                            placeholder="Jarvis"
                            {...register('botName')}
                            error={errors.name?.message?.toString()}
                          />
                        </div>
                        <div className="w-full mt-4">
                          <Label>Question sugesstions</Label>
                          <Input
                            defaultValue={project.defaultQuestion}
                            placeholder="How to use DocsAI?, How to add project?"
                            {...register('defaultQuestion')}
                            error={errors.defaultQuestion?.message?.toString()}
                          />
                        </div>
                        <div className="w-full mt-4">
                          <Label>Project description</Label>
                          <Input
                            defaultValue={project.description || ''}
                            placeholder="A nice description for project"
                            {...register('description')}
                            error={errors.description?.message?.toString()}
                          />
                        </div>
                        <div className="flex gap-3 items-center mt-4">
                          <Label>Generate summary</Label>
                          <Switch
                            className={`${generateSummary ? 'bg-blue-600' : 'bg-gray-200'
                              } relative inline-flex h-6 w-11 items-center rounded-full`}
                            checked={generateSummary}
                            onChange={setGenerateSummary}
                            disabled={!isAbovePro(org)}
                          >
                            <span className="sr-only">Generate summary</span>
                            <span
                              className={`${generateSummary ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                            />
                          </Switch>
                          {!isAbovePro(org) ? 'You need to be at least on Pro plan' : null}
                        </div>
                        <div className="mt-8">
                          <PrimaryButton className="mx-auto" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
                            Update
                          </PrimaryButton>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Snackbar isError={false} message={'Succefully updated'} show={showSuccess} setShow={setShowSuccess} />
      </main>
    </>
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
  const projectSlug = context.query.projectSlug as string

  const org = await prisma.orgUser.findFirst({
    where: {
      userId: session.user.id,
      org: {
        name: orgname,
      }
    },
    include: {
      org: {
        include: {
          projects: {
            where: {
              slug: projectSlug
            },
            include: {
              slackInstalation: {
                select: {
                  id: true,
                  teamName: true,
                }
              },
            }
          }
        }
      }

    }
  })

  if (!org || org.org.projects.length === 0) {
    return {
      redirect: {
        destination: `/dashboard/${orgname}`
      }
    }
  }

  const props = {
    props: {
      user: session.user,
      orgJson: superjson.stringify(org.org),
      projectJson: superjson.stringify(org.org.projects[0]),
    }
  }
  return props
}

export default SettingsPage;