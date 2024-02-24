import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, MailPlus, X } from "lucide-react";
import { CustomButton } from "~/components/form/button";
import { ChatWidget } from "~/containers/Chat/ChatWidget";
import { getContrastColor } from "~/utils/color";
import { SocialIcons, type TSocialIcons } from "~/components/icons/icons";
import { type AdditionFields } from "~/types";
import { type Project, type Org } from "@prisma/client";
import { type TDataHub } from "~/pages/dashboard/[orgname]/[projectSlug]/agent";
import { ScrollArea } from "~/components/ui/ScrollArea";


type TColors = {
  primaryColor: string,
  textColor: string
}

export type UserIdentification = {
  data: {
    source: 'docsai' | string,
    userDetails: {
      userId?: string,
      additionalFields: AdditionFields
    }
  }
}

type TPrevConvos = {
  id: string,
  firstMsg: string,
  createdAt: string
}

export const ChatV2: React.FC<{ org: Org, project: Project, showFooter: boolean }> = ({ org, project, showFooter }) => {

  const [currentTab, setCurrentTab] = useState('home')
  const [showAskUserId, setShowAskUserId] = useState(true)
  const [additionalFields, setAdditionalFields] = useState<AdditionFields>()
  const [userDetails, setUserDetails] = useState<UserIdentification['data']['userDetails']>()
  const [prevConvos, setPrevConvos] = useState<TPrevConvos[]>([])
  const [prevConvoId, setPrevConvoId] = useState<string | null>(null)
  const chatBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const myDiv = chatBox.current;
    if (myDiv) {
      myDiv.scrollTop = myDiv.scrollHeight;
    }

    if (typeof window !== "undefined") {
      const previousConvos = window.localStorage.getItem(`DOCSAI_CONVOS_${project.id}`)
      let convos = []
      if (previousConvos) {
        convos = JSON.parse(previousConvos) as TPrevConvos[]
        if (Array.isArray(convos)) {
          setPrevConvos(convos)
        }
      }
    }

    const windowEventListener = (ev: UserIdentification) => {

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (ev.data?.source == 'docsai') {
        const userDetails = ev.data.userDetails
        if (userDetails?.userId) {
          // setUserId('userId', ev.data.userDetails.userId)
          setShowAskUserId(false)
          setUserDetails(userDetails)
        }

        if (userDetails?.additionalFields) {
          setAdditionalFields(userDetails.additionalFields)
          setUserDetails(userDetails)
        }
        console.log("🤖 Received identification", ev.data)

      }
      // Do something with the message event
    };
    window.addEventListener('message', windowEventListener);

    return () => {
      window.removeEventListener('message', windowEventListener);
    };
  }, [currentTab])

  const changeTab = () => {
    if (currentTab == 'chat') {
      setPrevConvoId(null)
    }
    setCurrentTab(currentTab == 'home' ? 'chat' : 'home')
  }

  const onPastConvo = (id: string) => {
    setPrevConvoId(id)
    setCurrentTab('chat')
  }

  const onClose = () => {
    if (window.parent) {
      window.parent.postMessage({ source: 'docsai', message: 'close' }, '*')
    }
  }

  const colors: TColors = {
    primaryColor: project?.primaryColor || '#000000',
    textColor: getContrastColor(project?.primaryColor || '#000000')
  }

  const socialLinks = project.socialLinks as null | { [key: string]: string }
  const dataHub = project.dataHub as TDataHub | null

  return (
    <>
      <style>
        {
          `
          html {
            --primary-color: ${colors.primaryColor};
            --primary-color-dim: ${colors.primaryColor}10;
            --secondary-color: ${colors.primaryColor}90;
            --text-color: ${colors.textColor};
            --text-color-dim: ${colors.textColor}95;
          }
          `
        }
      </style>
      {
        currentTab == 'home' ?
          <>
            <ScrollArea className="max-w-lg shadow  h-full max-h-[700px] overflow-scroll   bg-gray-50/95">
              <div className=" bg-[var(--primary-color)]    py-6 p-2 rounded-t-lg  sticky top-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl tracking-wide font-semibold  ml-2 text-[var(--text-color)]">Hi {additionalFields?.name || 'there'}! ✋🏼 </h4>
                    <p className="ml-2  text-sm text-[var(--text-color-dim)]">Got a question? We would love to help you!</p>
                  </div>
                  <div >
                    <button onClick={onClose} className="flex justify-center hover:bg-[var(--primary-color-dim)] p-1 rounded-md ">
                      <X className="text-[var(--text-color)]" />
                    </button>

                  </div>
                </div>

              </div>

              <div className="m-2 my-4 p-2">
                {prevConvos.length ?
                  <div className="my-2">
                    <p className="font-bold text-base  text-gray-700 "> Your Conversations</p>
                    <div className="bg-white shadow rounded-lg mt-2">
                      {
                        prevConvos.map((each, i) => {
                          return (
                            <Fragment key={`${each.id}-${i}`}>
                              <button className="w-full   select-text p-3 hover:bg-[var(--primary-color-dim)]"
                                onClick={() => onPastConvo(each.id)}>
                                <div className={" w-full  "} >
                                  <div className="flex justify-between items-center">
                                    <p className="max-w-full text-left text-base truncate">
                                      {each.firstMsg}
                                    </p>
                                    <ChevronRight className="w-5 h-5 text-[var(--primary-color)]" />
                                  </div>
                                </div>
                              </button>
                              <hr></hr>
                            </Fragment>
                          )
                        })
                      }
                    </div>

                  </div>

                  :
                  <div className=" p-3 ">
                    <p className="text-lg text-gray-900 font-bold"> I am {project.botName}</p>
                    <p className="my-2 text-base text-gray-700 leading-6">
                      No past conversations yet. Ready to break the ice? I&apos;m all ears (or, well, text-ready!)                  </p>


                  </div>}
                <div className="flex justify-center">
                  <CustomButton className="my-4 shadow border-2 flex gap-2 text-[var(--primary-color)]  border-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-[var(--text-color)]"
                    onClick={changeTab}> <MailPlus className="w-5 h-5" /> New conversation</CustomButton>
                </div>
              </div>

              <hr></hr>
              {dataHub && dataHub.length > 0 &&
                <div className="m-2 mt-4 p-2">
                  <p className="font-bold text-base text-gray-700"> Data Hub</p>
                  <div className="mt-2 bg-white shadow  rounded-lg ">

                    {dataHub ? dataHub.map((each, i) => {
                      return (
                        <Fragment key={`${each.link}-${i}`}>
                          <button className="w-full   select-text p-3 hover:bg-[var(--primary-color-dim)]"
                            onClick={() => window.open(each.link)}>
                            <div className={" w-full  "} >
                              <div className="flex justify-between items-center" title="Sample conversation 2">
                                <p className="max-w-full text-left text-base">
                                  {each.title}
                                </p>
                                <div className="text-sm flex justify-between text-gray-600 mt-2 " >
                                  <div className="flex gap-2 mr-1">
                                    <ChevronRight className="w-5 h-5 text-[var(--primary-color)]" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                          <hr></hr>
                        </Fragment>
                      )
                    }) : null}

                  </div>
                </div>
              }

              <div className="m-2 mt-4 p-2 pb-20">
                {
                  socialLinks && Object.values(socialLinks).some(val => Boolean(val)) ? <>
                    <p className="font-bold text-base text-gray-700 "> Contact Us</p>
                    <div className="bg-white shadow p-2 mt-2 rounded-lg">
                      <div className="my-2  flex justify-center gap-3 ">
                        {
                          Object.keys(socialLinks).map((each) => {
                            if (socialLinks[each]) {
                              return (
                                <a href={socialLinks[each]} key={each} target="_blank" rel="noreferrer">
                                  <SocialIcons type={each as TSocialIcons} className="pointer-events-none" />
                                </a>
                              )
                            }
                            return null
                          })
                        }
                      </div>
                      {
                        project.supportEmail &&
                        <div className="mt-1  mb-2 text-center">
                          <a href={"mailto:" + project.supportEmail} className=" text-sm underline text-gray-500">{project.supportEmail}</a>
                        </div>
                      }
                    </div>
                  </> :
                    null
                }
              </div>
              {showFooter &&
                <p className="text-xs text-center fixed bottom-0 w-full bg-white p-1 border rounded-t-lg text-slate-900">Powered by
                  <span className="px-2 rounded bg-black text-white ml-2">DocsAI</span></p>
              }
            </ScrollArea>
          </> :
          <>
            <div className=" p-3 items-center flex justify-between text-lg  sticky top-0 z-10  bg-transparent backdrop-blur">
              <button onClick={changeTab} className="flex justify-center p-1 rounded-md hover:bg-[var(--primary-color-dim)]">
                <ArrowLeft className="text-[var(--primary-color)]" />
              </button>
              <div className="flex gap-2 items-center">
                {/* <Image alt='compant logo' src="/images/logo.png" height={27} width={27} className="rounded-lg" /> */}
                <p className="font-medium text-xl text-gray-700" >
                  {project.botName}
                </p>
              </div>
              <div className="flex gap-3">

                <button onClick={onClose} className="flex justify-center hover:bg-[var(--primary-color-dim)] p-1 rounded-md ">
                  <X className="text-[var(--primary-color)]" />
                </button>

              </div>
            </div>
            <ChatWidget org={org} project={project} userDetails={userDetails} convoId={prevConvoId} />
            {showFooter &&
              <p className="text-xs text-center bg-white   bottom-0 fixed w-full p-1  text-slate-900">Powered by
                <span className="px-2 rounded bg-black text-white ml-2">DocsAI</span>
              </p>
            }
          </>
      }
    </>
  )
}