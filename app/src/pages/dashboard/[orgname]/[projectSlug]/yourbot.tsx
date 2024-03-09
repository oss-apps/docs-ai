import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { ChatBox } from "~/containers/Chat/Chat";
import { Button } from "~/components/form/button";
import { Fragment, useState } from "react";
import { MarkDown } from "~/components/MarkDown";
import Link from "next/link";
import { IconCustomize, IconEmbed, IconLink, IconShare } from "~/components/icons/icons";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/Dialog"
import CommonSEO from "~/components/seo/Common";



const YourBot: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [shareText, setShareText] = useState('Share')

  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

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
        <title>Docs AI | Talk to your docs</title>
        <CommonSEO />
      </Head>
      <main className="h-full">
        <div className="flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full ">
            <div className="mt-4 p-2 sm:p-5 flex justify-center  ">
              <div className="max-w-5xl w-full  flex justify-end gap-y-6 sm:gap-y-0 sm:flex-col flex-col-reverse">
                <div className="flex justify-center gap-4 mb-2 pb-4 border-t-2 pt-4 sm:pt-0 sm:border-none sm:justify-end flex-wrap sm:flex-nowrap">
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
                    <IconShare className="h-5 w-5" /> {shareText}
                  </Button>
                  <Link href={`/dashboard/${org.name}/${project.slug}/agent`}>
                    <Button variant="outline" className="flex justify-center gap-2">
                      <IconCustomize className="h-5 w-5" />
                      Customize
                    </Button>
                  </Link>
                </div>
                <div>
                  <ChatBox org={org} project={project} />
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

export default YourBot;