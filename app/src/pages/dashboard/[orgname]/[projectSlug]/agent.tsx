import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type ProjectToken, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { QnA } from "~/containers/QnA/QnA";
import { ChatBox } from "~/containers/Chat/Chat";
import PrimaryButton, { SecondaryButton, SmallButton } from "~/components/form/button";
import { env } from "~/env.mjs";
import { type Dispatch, Fragment, type SetStateAction, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MarkDown } from "~/components/MarkDown";
import { Input, Label } from "~/components/form/input";
import { type FieldValues, type SubmitHandler, useForm, FieldValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { mergeObjects } from "~/utils/common";
import { getContrastColor } from "~/utils/color";
import { IconEmbed, IconShare } from "~/components/icons/icons";

export const projectSchema = z.object({
  defaultQuestion: z.string().min(3),
  botName: z.string().min(3),
  initialQuestion: z.string().min(3),
  primaryColor: z.string()
})

const projectDefaultValues = {
  defaultQuestion: 'How to use jarvis ?',
  botName: 'Jarvis',
  initialQuestion: 'Hi, I am Jarvis. How can I help you?',
  primaryColor: "#000000"

}


const QnAPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const project: Project = superjson.parse(projectJson)
  const org: Org = superjson.parse(orgJson)

  const [shareText, setShareText] = useState('Share')
  const [isEmbedOpen, setIsEmbedOpen] = useState(false)
  const [projectState, setProject] = useState(project)

  const onShareClick = async () => {
    await navigator.clipboard.writeText(`${location.origin}/chat/${project.id}`)
    setShareText('Copied')
    setTimeout(() => {
      setShareText('Share')
    }, 2000)
  }

  async function closeModal() {
    await navigator.clipboard.writeText(installScript());
    setIsEmbedOpen(false)
  }


  function openModal() {
    setIsEmbedOpen(true)
  }

  const installScript = () => {
    return `<script src="https://docsai.app/embed.min.js" project-id="${project.id}" async></script>`
  }

  return (
    <>
      <Head>
        <title>Docs AI - Appearance</title>
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />


          <div className="w-1/2 max-w-4xl p-4">
            <BotSetting project={project} setProject={setProject} />
          </div>
          <div className="w-1/2 max-w-xl p-4">
            <div className=" mx-auto">
              <ChatBox org={org} project={projectState} embed />
              <div className="flex justify-center gap-4 mt-4">
                <PrimaryButton onClick={openModal} className="justify-center gap-2 w-20">
                  <IconEmbed className="h-4 w-4" primaryClassName="fill-slate-400" secondaryClassName="fill-slate-50" />
                  Embed
                </PrimaryButton>
                <SecondaryButton onClick={onShareClick} className="justify-center gap-2 w-20">
                  <IconShare className="h-4 w-4" /> {shareText}
                </SecondaryButton>
              </div>
            </div>
          </div>

        </div>
        <Transition appear show={isEmbedOpen} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Add the following script to your website
                    </Dialog.Title>
                    <div className="mt-2">
                      <MarkDown markdown={`\`\`\`\n${installScript()}\n`} />
                    </div>

                    <div className="mt-4 mx-auto">
                      <PrimaryButton
                        type="button"
                        onClick={closeModal}
                        className="mx-auto"
                      >
                        Copy
                      </PrimaryButton>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </main>
    </>
  );
};

const BotSetting: React.FC<{ project: Project, setProject: Dispatch<SetStateAction<Project>> }> = ({ project, setProject }) => {
  const backgroundColor = project.primaryColor.toString() || '#000000'
  const [textColor, setTextColor] = useState(getContrastColor(backgroundColor))
  const [primaryColor, setPrimaryColor] = useState(backgroundColor)


  const { register, handleSubmit, formState: { errors }, getValues } = useForm<z.input<typeof projectSchema>>({ resolver: zodResolver(projectSchema) });
  const updateProject = api.project.updateBotSettings.useMutation()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { defaultQuestion, botName, initialQuestion, primaryColor } = data as any as z.input<typeof projectSchema>
    await updateProject.mutateAsync({ initialQuestion, projectId: project.id, defaultQuestion, botName, primaryColor })
  };

  const onFormChange = () => {
    const values = getValues()
    console.log(values)
    const textColor = getContrastColor(values.primaryColor)
    setTextColor(textColor)
    setPrimaryColor(values.primaryColor)
    setProject({ ...project, ...mergeObjects(projectDefaultValues, values) })
  }

  useEffect(() => {
    if (updateProject.isSuccess) {
      toast.success('Project updated')
    }
  }, [updateProject.isSuccess])

  return (
    <section id="projectForm" className="max-w-xl">
      <p className="text-gray-800 text-lg">Bot appearance</p>
      <div className="mt-4 border-t" />
      <form onSubmit={handleSubmit(onSubmit)} onChange={onFormChange} className="p-4 rounded-md">

        <div className="w-full mt-4">
          <Label>Bot Name</Label>
          <Input
            defaultValue={project.botName}
            placeholder="Jarvis"
            {...register('botName')}
            error={errors.botName?.message?.toString()}
          />
        </div>
        <div className="w-full mt-4">
          <Label title="Use commas for more questions">Question suggestions </Label>
          <Input
            defaultValue={project.defaultQuestion}
            placeholder="How to use DocsAI?, How to add project?"
            {...register('defaultQuestion')}
            error={errors.defaultQuestion?.message?.toString()}
          />
        </div>
        <div className="w-full mt-4">
          <Label>Initial question</Label>
          <Input
            defaultValue={project.initialQuestion ?? 'Hi, How can i help you today?'}
            placeholder="Hi , How can i help you today? "
            {...register('initialQuestion')}
            error={errors.initialQuestion?.message?.toString()}
          />
        </div>

        <div className="mt-4 flex items-end">
          <div>
            <Label title="Play with colors">Primary Color</Label>
            <input className="ml-1 py-0.5 px-1 w-20 rounded-lg" type="color" defaultValue={project.primaryColor}
              {...register('primaryColor')}
            />
          </div>
          <div className="ml-20  p-3 rounded-full" style={{ backgroundColor: primaryColor || project.primaryColor, color: textColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
            </svg>
          </div>
        </div>


        <div className="mt-20">
          <PrimaryButton type="submit" className="mx-auto" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
            Update
          </PrimaryButton>
        </div>
      </form>
    </section>

  )
}

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

  const props = { props: { user: session.user, orgJson: superjson.stringify(org.org), projectJson: superjson.stringify(org.org.projects[0]) } }
  return props
}

export default QnAPage;