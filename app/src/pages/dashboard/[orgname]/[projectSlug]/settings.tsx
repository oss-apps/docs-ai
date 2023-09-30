import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type ProjectToken, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { Input, Label, TextArea } from "~/components/form/input";
import PrimaryButton, { SmallButton, SmallSecondaryButton } from "~/components/form/button";
import { z } from "zod";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { type MouseEventHandler, useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { isAbovePro } from "~/utils/license";
import { toast } from "react-hot-toast";
import { IconLink, IconUpdate } from "~/components/icons/icons";
import { DEFAULT_PROMPT } from "~/server/constants";
import Link from "next/link";


const projectSchema = z.object({
  name: z.string().min(3).max(50),
  defaultPrompt: z.string(),
  description: z.string().optional(),
})


const SettingsPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project & {
    slackInstalation: {
      id: string;
      teamName: string;
    } | null,
    projectToken: ProjectToken | null,
  } = superjson.parse(projectJson)

  const [apiKey, setApiKey] = useState<string>(project.projectToken?.projectApiKey ?? '')
  const [isCopied, setIsCopied] = useState(false)

  const [generateSummary, setGenerateSummary] = useState(project.generateSummary)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ resolver: zodResolver(projectSchema) });

  const updateProject = api.project.updateProject.useMutation()

  const createApiToken = api.project.createOrRecreateApiKey.useMutation()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, description, defaultPrompt } = data as any as z.input<typeof projectSchema>
    await updateProject.mutateAsync({ name, description, orgId: org.id, projectId: project.id, generateSummary, defaultPrompt })
  };


  useEffect(() => {
    if (updateProject.isSuccess) {
      toast.success('Project updated')
    }
  }, [updateProject.isSuccess])

  const onGenerateApiKey = async () => {
    setApiKey('--')
    const { apiKey } = await createApiToken.mutateAsync({ orgId: org.id, projectId: project.id })
    setApiKey(apiKey)
  }

  const onApiCopy = async () => {
    await navigator.clipboard.writeText(apiKey)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const onResetPrompt: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setValue('defaultPrompt', DEFAULT_PROMPT)
  }

  return (
    <>
      <Head>
        <title>Docs AI - Settings</title>
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full h-full overflow-auto pb-20">
            <div className="mt-10 p-2 sm:p-5">
              <div className="max-w-5xl mx-auto">
                <div>
                  <div className="flex items-center text-gray-800 text-lg gap-2 border-b-2 pb-2">Integrations
                  </div>
                  <div className="m-2 mt-4 p-3 bg-gray-100 rounded-md flex items-center justify-between">
                    {project.slackInstalation ? (
                      <div>
                        Slack connected with the workspace <span className="bg-orange-100 text-orange-500 p-1 rounded">{project.slackInstalation.teamName}</span>
                      </div>
                    ) : (
                        <div className="flex w-full justify-between  items-center flex-col gap-y-4 sm:flex-row">
                        <p>Connect slack to ask questions in your channels</p>
                          <div className="flex justify-center">
                            <a href={`https://slack.com/oauth/v2/authorize?client_id=5026673231779.5023868711141&scope=app_mentions:read,chat:write,commands&state=${project.id}`}>
                              <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                            </a>
                          </div>

                        </div>
                    )}
                  </div>
                  <div className="mt-10">
                    <p className="text-gray-800 text-lg border-b-2 pb-2">Project settings</p>
                    <div className="flex gap-10">
                      <div className="w-full">
                        <form onSubmit={handleSubmit(onSubmit)} className="my-4 rounded-md">
                          <div className="w-full">
                            <Label>Project Name</Label>
                            <Input
                              defaultValue={project.name}
                              placeholder="A good name"
                              {...register('name')}
                              error={errors.name?.message?.toString()}
                            />
                          </div>
                          <div className="w-full mt-6">
                            <Label>Project description</Label>
                            <Input
                              defaultValue={project.description || ''}
                              placeholder="A nice description for project"
                              {...register('description')}
                              error={errors.description?.message?.toString()}
                            />
                          </div>
                          <div className="w-full mt-6">
                            <Label title="Changing this might affect bot performance">System Prompt</Label>
                            <TextArea
                              error={errors.src?.message?.toString()}
                              rows={5}
                              defaultValue={project.defaultPrompt}
                              placeholder={"Write a concise prompt"}
                              {...register('defaultPrompt', { required: 'Prompt is required' })}
                            />
                            <SmallSecondaryButton onClick={onResetPrompt}>Reset</SmallSecondaryButton>
                          </div>
                          <div className="flex gap-3 items-center mt-6">
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
                          {generateSummary ? <p className="ml-1 text-sm text-zinc-500">Summary will use your  chat credits.</p> : ''}
                          <div className="mt-8">
                            <PrimaryButton className="mx-auto flex justify-center gap-2" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
                              <IconUpdate className="w-5 h-5" primaryClassName="fill-slate-400" secondaryClassName="fill-slate-50" /> Update
                            </PrimaryButton>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="mt-10">
                    <div className="flex items-center text-gray-800 text-lg gap-2 border-b-2 pb-2">API Settings
                      <Link href="/docs/integrations#api" className=" rounded-lg p-1 hover:bg-zinc-100" target="_blank" title="View Documentation">
                        <IconLink />
                      </Link></div>
                    <div className="flex gap-10">
                      <div className="w-full">
                        <div className="p-4">
                          <Label>API key</Label>
                          <div className="p-3 bg-zinc-100 rounded-lg">
                            {apiKey ? (
                              <div className="flex justify-between items-center">
                                <p className="text-zinc-600 tracking-wider">************{apiKey.substring(apiKey.length - 4, apiKey.length)}</p>
                                <div className="flex gap-2">
                                  <button onClick={onApiCopy} className="border border-zinc-400 rounded-lg p-1 hover:bg-zinc-200">
                                    {isCopied ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>

                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                      </svg>
                                    )}
                                  </button>
                                  <button onClick={onGenerateApiKey} className="border border-zinc-400 rounded-lg p-1 hover:bg-zinc-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                    </svg>
                                  </button>

                                  <Link href="/docs/integrations#api" className="border border-zinc-400 rounded-lg p-1 hover:bg-zinc-200" target="_blank" title="View Documentation">
                                    <IconLink />
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center">
                                <p className="text-zinc-600">Not created yet</p>

                                <PrimaryButton onClick={onGenerateApiKey} loading={createApiToken.isLoading} disabled={createApiToken.isLoading}>
                                  Generate
                                </PrimaryButton>
                              </div>
                            )}
                          </div>
                          <div className="mt-4 text-zinc-500">Project ID <span className="text-zinc-700 font-semibold bg-zinc-100 p-1 rounded-md">{project.id}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              projectToken: true
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