import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { IndexStatus, type Org, type Project } from "@prisma/client";
import superjson from "superjson";
import PrimaryButton, { SmallButton } from "~/components/form/button";
import AppNav from "~/containers/AppNav/AppNav";
import { api } from "~/utils/api";
import Link from "next/link";


const Documents: NextPage<{ user: User, orgJson: string, projectJson: string }> = ({ user, orgJson, projectJson }) => {
  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)

  const { data, isLoading, refetch } = api.document.getDocuments.useQuery({ orgId: org.id, projectId: project.id })
  const retry = api.document.reIndexDocument.useMutation()

  const onRetry = async (documentId: string) => {
    await retry.mutateAsync({ orgId: org.id, projectId: project.id, documentId })
    await refetch()
  }

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
            <div className="p-5 px-10">
              <div className="flex justify-between">
                <h2 className="text-lg">Documents</h2>
                <Link href={`/dashboard/${org.name}/${project.slug}/new_document`}>
                  <PrimaryButton>+ Add document</PrimaryButton>
                </Link>
              </div>
              {isLoading ? <div>Loading...</div> :
                data?.documents?.length === 0 ? (
                  <div className="mt-4 border-t">
                    <p className="text-center mt-10">No documents added yet!</p>
                  </div>
                ) : (
                  <div className="border mt-4  rounded-md">
                    <ul>
                      {data?.documents.map((document) => (
                        <li key={document.id} className="p-5 flex justify-between items-center border-b last:border-none">
                          <div>
                            <div className="font-semibold">{document.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-2xl">{document.src}</div>
                          </div>
                          <div>
                            {
                              document.indexStatus === IndexStatus.SUCCESS ?
                                <div className="text-sm text-green-600 bg-green-200 p-0.5 rounded-md px-2">Indexed</div> :
                                document.indexStatus === IndexStatus.INDEXING ?
                                  <div className="text-sm text-orange-600 bg-orange-200 p-0.5 rounded-md px-2">Indexing</div> :
                                  <div className="flex">
                                    <div className="text-sm text-red-600 bg-red-200 p-0.5 rounded-md px-2">Failed</div>
                                    <SmallButton
                                      className="ml-2"
                                      onClick={() => onRetry(document.id)}>
                                      Retry
                                    </SmallButton>
                                  </div>
                            }
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              }
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

export default Documents;