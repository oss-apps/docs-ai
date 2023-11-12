import { type GetServerSidePropsContext, type NextPage } from "next";
import { type User } from "next-auth";
import Head from "next/head";
import { prisma } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";
import { type Org, type Project, DocumentType } from "@prisma/client";
import superjson from "superjson";
import AppNav from "~/containers/Nav/AppNav";
import { URLDocument } from "~/containers/NewDocument/URLDocument";
import { useRouter } from 'next/router'
import { TextDocument } from "~/containers/NewDocument/TextDocument";
import NavBack from "~/components/NavBack";
import { FileDocument } from "~/containers/NewDocument/FileDocument";
import { NotionDocument } from "~/containers/NewDocument/NotionDocument";
import { Files, FileText, Globe } from "lucide-react";
import { IconConfluence, IconNotion } from "~/components/icons/icons";
import { ConfluenceDocument } from "~/containers/NewDocument/ConfluenceDocument";



const NewDocument: NextPage<{ user: User, orgJson: string, projectJson: string, notion: string }> = ({ user, orgJson, projectJson, notion }) => {
  const router = useRouter()
  const { docType } = router.query as { docType: DocumentType, orgname: string, projectSlug: string }


  const org: Org = superjson.parse(orgJson)
  const project: Project = superjson.parse(projectJson)


  return (
    <>
      <Head>
        <title>Docs AI - Add Documents</title>
      </Head>
      <main className="h-full">
        <div className="h-full flex">
          <AppNav user={user} org={org} project={project} />
          <div className="w-full p-2 sm:p-5">

            <div className="m-2 max-w-5xl  mx-auto mt-5">
              {docType ? (
                <div className="max-w-2xl mx-auto">
                  <NavBack href={`/dashboard/${org.name}/${project.slug}/new_document`} />
                  <CreateDocumentForm org={org} project={project} docType={docType} />
                </div>
              ) : (
                  <>
                    <div className="flex items-center text-gray-800 text-lg gap-2 pb-2">Add Documents
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 gap-2  mt-4">
                    <DocumentSource name="Web" type={DocumentType.URL} url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.URL}`} />
                    <DocumentSource name="Files" type={DocumentType.FILES} url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.FILES}`} />
                    <DocumentSource name="Text" type={DocumentType.TEXT} url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.TEXT}`} />
                    <DocumentSource name="Notion" type={DocumentType.NOTION} url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.NOTION}`} />
                    <DocumentSource name="Confluence" type={DocumentType.CONFLUENCE} url={`/dashboard/${org.name}/${project.slug}/new_document?docType=${DocumentType.CONFLUENCE}`} />

                </div>
                  </>

              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

const CreateDocumentForm: React.FC<{ org: Org, project: Project, docType: DocumentType }> = ({ org, project, docType }) => {
  if (docType === DocumentType.TEXT) {
    return <TextDocument org={org} project={project} />
  }
  else if (docType === DocumentType.FILES) {
    return <FileDocument project={project} org={org} />
  }
  else if (docType === DocumentType.NOTION) {
    return <NotionDocument project={project} org={org} newDocument />
  }
  else if (docType === DocumentType.URL) {
    return <URLDocument org={org} project={project} />
  }
  else if (docType === DocumentType.CONFLUENCE) {
    return <ConfluenceDocument org={org} project={project} />
  }

  return <>
    No doc type added
  </>
}


const DocumentSource: React.FC<{ name: string, type: DocumentType, url?: string }> = ({ name, type, url }) => {
  const router = useRouter()

  return (
    <button className="border rounded-lg py-2  hover:bg-slate-50" onClick={() => url ? router.push(url) : null}>
      <div className="flex items-center gap-2 mx-3 my-2 font-medium   text-slate-800">
        {IconTypes[type]} {IconNames[type]}
      </div>
      <p className="text-slate-500 text-start mx-3 my-1 text-sm"> {IconDescription[type]}</p>  
    </button>
  )
}

const IconTypes = {
  [DocumentType.URL]: <Globe className="w-5 h-5" />,
  [DocumentType.FILES]: <Files className="w-5 h-5" />,
  [DocumentType.TEXT]: <FileText className="w-5 h-5" />,
  [DocumentType.NOTION]: <IconNotion className="w-5 h-5" />,
  [DocumentType.CONFLUENCE]: <IconConfluence />,
  [DocumentType.CHAT]: null,
  [DocumentType.PDF]: null,
}

const IconNames = {
  [DocumentType.URL]: "Add a website",
  [DocumentType.FILES]: "Upload Files",
  [DocumentType.TEXT]: "Add Text",
  [DocumentType.NOTION]: "Notion",
  [DocumentType.CONFLUENCE]: "Confluence",
  [DocumentType.CHAT]: null,
  [DocumentType.PDF]: null
}

const IconDescription = {
  [DocumentType.URL]: "Fetch sub pages and extract text content from them.",
  [DocumentType.FILES]: "Files such as PDFs, Docx, Txt can be uploaded.",
  [DocumentType.TEXT]: "Text can be used for info that may not be in other sources.",
  [DocumentType.NOTION]: "Connect your notion workspace and add pages to DocsAI.",
  [DocumentType.CONFLUENCE]: "Link your Confluence pages to keep the knowledge flowing.",
  [DocumentType.CHAT]: null,
  [DocumentType.PDF]: null,

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

  if (!org) {
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

export default NewDocument;