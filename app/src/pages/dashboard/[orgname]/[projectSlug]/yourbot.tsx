import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { ChatBox } from "~/containers/Chat/Chat";
import PrimaryButton, { SecondaryButton } from "~/components/form/button";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MarkDown } from "~/components/MarkDown";
import Link from "next/link";
import { IconCustomize, IconEmbed, IconShare } from "~/components/icons/icons";


const YourBot: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const [shareText, setShareText] = useState('Share')
  const [isEmbedOpen, setIsEmbedOpen] = useState(false)

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
        <title>Docs AI - Bot</title>
      </Head>
      <main className="h-full">
        <div className="flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full ">
            <div className="mt-4 p-2 sm:p-5">
              <div className="max-w-5xl flex gap-y-6 sm:gap-y-0 sm:flex-col flex-col-reverse">
                <div className="flex justify-start gap-4 mb-2 pb-4 border-t-2 pt-4 sm:pt-0 sm:border-none sm:justify-end">
                  <SecondaryButton onClick={openModal} className="hidden sm:flex justify-center gap-2">
                    <IconEmbed className="h-5 w-5" />
                    <span> Embed </span>
                  </SecondaryButton>
                  <SecondaryButton onClick={onShareClick} className="justify-center gap-2">
                    <IconShare className="h-5 w-5" /> {shareText}
                  </SecondaryButton>
                  <Link href={`/dashboard/${org.name}/${project.slug}/agent`}>
                    <SecondaryButton className="flex justify-center gap-2">
                      <IconCustomize className="h-5 w-5" />
                      Customize
                    </SecondaryButton>
                  </Link>
                </div>
                <div>
                <ChatBox org={org} project={project} />
                </div>

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