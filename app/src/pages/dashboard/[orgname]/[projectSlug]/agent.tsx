import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/AppNav/AppNav";
import { QnA } from "~/containers/QnA/QnA";
import { ChatBox } from "~/containers/Chat/Chat";
import PrimaryButton, { SmallButton } from "~/components/form/button";
import { env } from "~/env.mjs";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MarkDown } from "~/components/MarkDown";


const QnAPage: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
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

  function closeModal() {
    setIsEmbedOpen(false)
  }

  function openModal() {
    setIsEmbedOpen(true)
  }

  const installMsg = "```\nyarn add @docsai/chat-sdk \n```\nor\n```\nnpm install @docsai/chat-sdk\n```"
  const initialiseMsg = `\`\`\`\nimport { initDocsAI } from \"@docsai/chat-sdk\";\n\n// Second argument will be the primary color of the chat widget\ninitDocsAI(\"${project.id}\", \"#000\");\n`

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
            <div className="mt-5 p-5 px-10">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-end">
                  <SmallButton onClick={openModal} className="mb-5 w-20 mr-5">
                    Embed
                  </SmallButton>
                  <SmallButton onClick={onShareClick} className="mb-5 w-20">
                    {shareText}
                  </SmallButton>
                </div>
                <ChatBox org={org} project={project} />
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
                    Install SDK
                  </Dialog.Title>
                  <div className="mt-2">
                    <MarkDown markdown={installMsg} />
                  </div>

                  <div className="mt-5 text-lg font-medium leading-6 text-gray-900">
                    <p>Initialise SDK</p>
                  </div>

                  <div>
                    <MarkDown markdown={initialiseMsg} />
                  </div>


                  <div className="mt-4 mx-auto">
                    <PrimaryButton
                      type="button"
                      onClick={closeModal}
                      className="mx-auto"
                    >
                      Done
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

export default QnAPage;