/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import PrimaryButton, { Button, SecondaryButton } from "~/components/form/button";
import { type Dispatch, Fragment, type SetStateAction, useEffect, useState } from "react";
import { MarkDown } from "~/components/MarkDown";
import { Input, Label } from "~/components/form/input";
import { type FieldValues, type SubmitHandler, useForm, useFieldArray, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/utils/api";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { mergeObjects } from "~/utils/common";
import { getContrastColor } from "~/utils/color";
import { IconAdd, IconEmbed, IconLink, IconShare, IconUpdate, type TSocialIcons } from "~/components/icons/icons";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/Dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs"
import Link from "next/link";
import { ScrollArea } from "~/components/ui/ScrollArea";
import { ChatV2 } from "~/containers/Chat/ChatV2";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/Alert";
import { RocketIcon } from "lucide-react";


export const socialLinksSchema = z.object({
  discord: z.string().url().optional().or((z.literal(''))).nullable(),
  facebook: z.string().url().optional().or((z.literal(''))).nullable(),
  instagram: z.string().url().optional().or((z.literal(''))).nullable(),
  linkedIn: z.string().url().optional().or((z.literal(''))).nullable(),
  whatsapp: z.string().url().optional().or((z.literal(''))).nullable(),
  x: z.string().url().optional().or((z.literal(''))).nullable(),
  telegram: z.string().url().optional().or((z.literal(''))).nullable(),
  website: z.string().url().optional().or((z.literal(''))).nullable(),
  github: z.string().url().optional().or((z.literal(''))).nullable(),

})

const dataHubSchema = z.object({
  dataHub: z.array(z.object({
    link: z.string().url(),
    title: z.string().min(6).max(70)
  }))
})

export const projectSchema = z.object({
  defaultQuestion: z.string().min(3),
  botName: z.string().min(3),
  initialQuestion: z.string().min(3),
  primaryColor: z.string(),
  supportEmail: z.string().email().optional().nullable().or(z.literal('')).transform((val) => val || null),
  askUserId: z.string().max(55).optional().nullable().or(z.literal('')).transform((val) => val || null),
  socialLinks: socialLinksSchema,
  dataHub: z.array(z.object({
    link: z.string().url(),
    title: z.string().min(6).max(70)
  }))
})

export type TDataHub = z.input<typeof dataHubSchema>['dataHub']

const projectDefaultValues = {
  defaultQuestion: 'How to use jarvis ?',
  botName: 'Jarvis',
  initialQuestion: 'Hi, I am Jarvis. How can I help you?',
  primaryColor: "#000000"
}

enum SettingsTabs {
  general = 'General',
  social = 'Social',
  dataHub = 'Data Hub'
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
    return `<script src="https://docsai.app/embed.min.js" project-id="${project.id}" version-number="2" async></script>`
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
            <div className="w-full sm:2/5 md:w-3/5 max-w-5xl">
            <BotSetting project={project} setProject={setProject} />
          </div>
            <div className="w-full sm:3/5 md:w-2/5 max-w-[450px] ">
              <div className="flex justify-center gap-4 my-4">
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
              <div className=" h-[700px]  border rounded-lg">
                <ChatV2 org={org} project={projectState} showFooter={false} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

const socialLinksForm: Array<{ key: TSocialIcons; label: string; link?: string }> = [
  { key: "website", label: "Website", link: "https://www.example.com" }, // Replace with your website URL
  { key: "facebook", label: "Facebook", link: "https://www.facebook.com" },
  { key: "x", label: "X Formerly Twitter", link: "https://www.x.com" }, // Update with correct URL if known
  { key: "linkedIn", label: "LinkedIn", link: "https://www.linkedin.com" },
  { key: "github", label: "Github", link: "https://github.com" },
  { key: "discord", label: "Discord", link: "https://discord.com" },
  { key: "whatsapp", label: "WhatsApp", link: "https://web.whatsapp.com" },
  { key: "telegram", label: "Telegram", link: "https://web.telegram.org" },
  { key: "instagram", label: "Instagram", link: "https://www.instagram.com" },

];

const BotSetting: React.FC<{ project: Project, setProject: Dispatch<SetStateAction<Project>> }> = ({ project, setProject }) => {
  const backgroundColor = project.primaryColor.toString() || '#000000'
  const [textColor, setTextColor] = useState(getContrastColor(backgroundColor))
  const [primaryColor, setPrimaryColor] = useState(backgroundColor)
  const [currentTab, setCurrentTab] = useState(SettingsTabs.general)
  const [tabError, setTabError] = useState<{
    [SettingsTabs.dataHub]: undefined | "true",
    [SettingsTabs.general]: undefined | "true",
    [SettingsTabs.social]: undefined | "true"
  }>({ [SettingsTabs.general]: undefined, [SettingsTabs.dataHub]: undefined, [SettingsTabs.social]: undefined })
  const [shareText, setShareText] = useState('Share')



  const { register, handleSubmit, control, formState: { errors }, getValues } = useForm<z.input<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      askUserId: project.askUserId,
      botName: project.botName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      socialLinks: project.socialLinks as any,
      defaultQuestion: project.defaultQuestion,
      initialQuestion: project.initialQuestion ?? projectDefaultValues.initialQuestion,
      primaryColor: project.primaryColor,
      supportEmail: project.supportEmail,
      dataHub: project.dataHub ? project.dataHub as TDataHub : [{ link: '', title: '' }, { link: '', title: '' }]

    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "dataHub", // unique name for your Field Array
  });



  const updateProject = api.project.updateBotSettings.useMutation()

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setTabError({ [SettingsTabs.general]: undefined, [SettingsTabs.dataHub]: undefined, [SettingsTabs.social]: undefined })
    const { defaultQuestion, botName, initialQuestion, primaryColor, supportEmail, askUserId, dataHub, socialLinks } = data as z.input<typeof projectSchema>
    await updateProject.mutateAsync({ initialQuestion, projectId: project.id, defaultQuestion, botName, primaryColor, supportEmail, askUserId, dataHub, socialLinks })
  };

  const onError = (errors: FieldErrors<z.input<typeof projectSchema>>) => {
    console.log("🔥 ~ errors:", errors)

    if (errors?.dataHub) {
      setTabError({
        [SettingsTabs.general]: undefined,
        [SettingsTabs.dataHub]: "true",
        [SettingsTabs.social]: undefined,
      })
      toast.error("Data Hub form incorrect!")
    }
    else if (errors?.socialLinks) {
      setTabError({
        [SettingsTabs.general]: undefined,
        [SettingsTabs.dataHub]: undefined,
        [SettingsTabs.social]: "true"
      })
      toast.error("Contact us form incorrect!")
    }
    else {
      setTabError({
        [SettingsTabs.general]: "true",
        [SettingsTabs.dataHub]: undefined,
        [SettingsTabs.social]: undefined
      })
      toast.error("General form incorrect!")
    }

  }

  const onFormChange = () => {
    const values = getValues()
    console.log(values)
    const textColor = getContrastColor(values.primaryColor)
    setTextColor(textColor)
    setPrimaryColor(values.primaryColor)
    setProject({ ...project, ...mergeObjects(projectDefaultValues, values) })
  } 

  // const onChangeTab = (tab: Tabs) => {
  //   setCurrentTab(tab)
  // }

  const onAppend = () => {
    const dataHubValues = getValues().dataHub
    if (dataHubValues.length > 3) {
      toast.error("You can only add 4 resources!")
      return
    }
    append({ link: '', title: '' });
  }

  const onRemove = (index: number) => {
    remove(index)
    onFormChange()
  }

  useEffect(() => {
    if (updateProject.isSuccess) {
      toast.success('Project updated')
    }
  }, [updateProject.isSuccess])

  return (
    <section id="projectForm" className="max-w-xl">
      <Alert variant='default' className="my-4 pb-4">
        <RocketIcon className="h-4 w-4" />
        <AlertTitle>Chatbot v2 beta is now available</AlertTitle>
        <AlertDescription> All existings chatbots will be migrated to v2 automatically on Apr 1 , 2024.
          <Link href={`/docs/integrations/integration-web`} target="_blank" className="font-semibold underline">  Learn more </Link>
        </AlertDescription>

      </Alert>
      <Tabs defaultValue={currentTab} className="p-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value={SettingsTabs.general} showerror={tabError[SettingsTabs.general]}>{SettingsTabs.general}

          </TabsTrigger>
          <TabsTrigger value={SettingsTabs.dataHub} showerror={tabError[SettingsTabs.dataHub]}>{SettingsTabs.dataHub}
          </TabsTrigger>
          <TabsTrigger value={SettingsTabs.social} showerror={tabError[SettingsTabs.social]} >Contact Us
          </TabsTrigger>
        </TabsList>
        <TabsContent value={SettingsTabs.general}>
          <form onSubmit={handleSubmit(onSubmit, onError)} onChange={onFormChange} className="rounded-md">
            <ScrollArea className="lg:[h-60vh] " >
              <div className=" grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <Label>Bot Name</Label>
                  <Input
                    defaultValue={project.botName}
                    placeholder="Jarvis"
                    {...register('botName')}
                    error={errors.botName?.message?.toString()}
                  />
                </div>
                <div className="col-span-2">
                  <Label title="Use commas for more questions">Question suggestions </Label>
                  <Input
                    defaultValue={project.defaultQuestion}
                    placeholder="How to use DocsAI?, How to add project?"
                    {...register('defaultQuestion')}
                    error={errors.defaultQuestion?.message?.toString()}
                  />
                </div>
                <div className="col-span-2" >
                  <Label>Initial question</Label>
                  <Input
                    defaultValue={project.initialQuestion ?? 'Hi, How can i help you today?'}
                    placeholder="Hi , How can i help you today? "
                    {...register('initialQuestion')}
                    error={errors.initialQuestion?.message?.toString()}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label title="Shows up in contact us and conversations">Support Email</Label>
                  <Input
                    defaultValue={project.supportEmail || ''}
                    placeholder="hey@support.com "
                    {...register('supportEmail')}
                    type="email"
                    error={errors.supportEmail?.message?.toString()}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label title="Leave blank if not applicable.">Prompt user email</Label>
                  <Input
                    defaultValue={project.askUserId || ''}
                    placeholder="Enter your email address to be notified of updates."
                    {...register('askUserId')}
                    type="text"
                    error={errors.askUserId?.message?.toString()}
                  />
                </div>

                <div className="flex items-end">
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
              </div>

            </ScrollArea>

            <div className="mt-6 flex justify-end">
              <PrimaryButton type="submit" className=" flex justify-center gap-2" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
                <IconUpdate className="w-5 h-5" primaryClassName="fill-slate-400" secondaryClassName="fill-slate-50" /> Save
              </PrimaryButton>
            </div>
          </form>
        </TabsContent>
        <TabsContent value={SettingsTabs.dataHub}>
          <form onSubmit={handleSubmit(onSubmit, onError)} onChange={onFormChange} className="rounded-md ">
            <ScrollArea className="lg:h-[60vh]" >
              <ul>
                {fields.map((item, index) => (
                  <li key={item.id} className="border  rounded-md p-4 my-4">
                    <div className="flex justify-between">
                      <p className="text-base font-medium text-slate-900"> Resource {index + 1} </p>
                      <button type="button" className=" rounded-md px-2  text-red-500 hover:bg-red-50" onClick={() => onRemove(index)}> Remove</button>
                    </div>
                    <div className="my-4">
                      {/* <Label>Title</Label> */}
                      <Input
                        defaultValue={item.title}
                        placeholder="Title : How to get things done?"
                        {...register(`dataHub.${index}.title` as const)}
                        error={errors.dataHub?.[index]?.title?.message?.toString()}
                      />
                    </div>
                    <div >
                      {/* <Label>Link</Label> */}
                      <Input
                        defaultValue={item.link}
                        placeholder="Link : https://docsai.app/blogs/how-to-get-things-done"
                        {...register(`dataHub.${index}.link` as const, { required: true, minLength: 6 })}
                        error={errors.dataHub?.[index]?.link?.message?.toString()}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="flex justify-between gap-4 mt-6">
              <SecondaryButton type="button" onClick={onAppend} className="gap-2"> <IconAdd /> New resource</SecondaryButton>
              <PrimaryButton type="submit" className=" gap-2" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
                <IconUpdate className="w-5 h-5" primaryClassName="fill-slate-400" secondaryClassName="fill-slate-50" /> Save
              </PrimaryButton>
            </div>

          </form>

        </TabsContent>
        <TabsContent value={SettingsTabs.social}>
          <form onSubmit={handleSubmit(onSubmit, onError)} onChange={onFormChange} className="rounded-md">
            <ScrollArea className="lg:h-[60vh]" >
              <div className="grid grid-cols-1 gap-4">
                {
                  socialLinksForm.map((each, i) => {
                    return (
                      <div className="w-full" key={i}>
                        <Label className="flex gap-2">
                          {/* <SocialIcons type="facebook" className="w-5 h-5" />  */}
                          {each.label}</Label>
                        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access  */}
                        <Input defaultValue={(project?.socialLinks as any)?.[each.key]}
                          {...register(`socialLinks.${each.key}`)}
                          placeholder={each.link}
                          error={errors.socialLinks?.[each.key]?.message?.toString()}
                        />
                      </div>
                    )
                  })
                }
              </div>

            </ScrollArea>
            <div className="mt-6 flex justify-end ">
              <PrimaryButton type="submit" className=" gap-2" disabled={updateProject.isLoading} loading={updateProject.isLoading}>
                <IconUpdate className="w-5 h-5" primaryClassName="fill-slate-400" secondaryClassName="fill-slate-50" /> Save
              </PrimaryButton>
            </div>
          </form>
        </TabsContent>

      </Tabs>    
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