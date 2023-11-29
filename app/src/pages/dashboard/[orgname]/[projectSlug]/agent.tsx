import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { ChatBox } from "~/containers/Chat/Chat";
import PrimaryButton, { Button } from "~/components/form/button";
import { type Dispatch, Fragment, type SetStateAction, useEffect, useState } from "react";
import { MarkDown } from "~/components/MarkDown";
import { Input, Label } from "~/components/form/input";
import { type FieldValues, type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { mergeObjects } from "~/utils/common";
import { getContrastColor } from "~/utils/color";
import { IconEmbed, IconLink, IconShare, IconUpdate } from "~/components/icons/icons";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/Dialog"
import Link from "next/link";

export const projectSchema = z.object({
  defaultQuestion: z.string().min(3),
  botName: z.string().min(3),
  initialQuestion: z.string().min(3),
  primaryColor: z.string(),
  supportEmail: z.string().email().optional().nullable().or(z.literal('')).transform((val) => val || null),
  askUserId: z.string().max(55).optional().nullable().or(z.literal('')).transform((val) => val || null),

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
          <section className="flex flex-wrap md:flex-nowrap w-full p-2 sm:p-4">
            <div className="w-full sm:2/5 md:w-3/5 max-w-4xl">
            <BotSetting project={project} setProject={setProject} />
          </div>
            <div className="w-full sm:3/5 md:w-2/5 max-w-2xl ">
            <div className="mx-auto">
              <ChatBox org={org} project={projectState} embed />
                <div className="flex justify-center gap-4 mt-4 mb-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="hidden sm:flex justify-center gap-2">
                        <IconEmbed className="h-5 w-5" />
                        <span> Embed </span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Embed as chat bot </DialogTitle>
                        <DialogDescription>
                          Add the following script to your website
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-2">
                        <MarkDown markdown={`\`\`\`\n${installScript()}\n`} />
                      </div>
                      <DialogTitle>Embed as iFrame </DialogTitle>
                      <DialogDescription>If you prefer a standalone chatbot embedded as an iframe instead of having a chat bot icon. <Link target="_blank" className="text-black font-bold  inline-flex gap-1" href='/docs/integrations/integration-iframe'> Learn more <IconLink /> </Link>  </DialogDescription>
                      <DialogFooter className="gap-2">
                        <DialogClose asChild>
                          <Button variant="default" type="button" onClick={closeModal} className="justify-center">
                            Copy
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={onShareClick} className="justify-center gap-2">
                    <IconShare className="h-4 w-4" /> {shareText}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
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
    const { defaultQuestion, botName, initialQuestion, primaryColor, supportEmail, askUserId } = data as z.input<typeof projectSchema>
    await updateProject.mutateAsync({ initialQuestion, projectId: project.id, defaultQuestion, botName, primaryColor, supportEmail, askUserId })
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
      <p className="text-gray-800 text-lg">Bot Appearance</p>
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

        <div className="w-full mt-4">
          <Label title="Each answer will show @ along with feedbacks">Support Email</Label>
          <Input
            defaultValue={project.supportEmail || ''}
            placeholder="hey@support.com "
            {...register('supportEmail')}
            type="email"
            error={errors.supportEmail?.message?.toString()}
          />
        </div>

        <div className="w-full mt-4">
          <Label title="Leave blank if not applicable.">Prompt user email</Label>
          <Input
            defaultValue={project.askUserId || ''}
            placeholder="Enter your email address to be notified of updates."
            {...register('askUserId')}
            type="text"
            error={errors.askUserId?.message?.toString()}
          />
        </div>

        <div className="mt-4 flex items-end">
          <div>
            <Label title="Use your brand colors">Primary Color</Label>
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
          <PrimaryButton type="submit" className="mx-auto flex justify-center gap-2" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
            <IconUpdate className="w-5 h-5" primaryClassName="fill-slate-400" secondaryClassName="fill-slate-50" /> Save
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