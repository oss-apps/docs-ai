import { useSession } from "next-auth/react";
import { useEffect } from "react"

declare global {
  interface Window {
    DOCS_AI: TDOCS_AI;
  }
}

type TDOCS_AI = {
  userId: string | null,
  additionalFields: { [key: string]: unknown; } | undefined
}


const SetUserInWindow: React.FC = () => {

  const { data: sessionData } = useSession();
  if (sessionData?.user?.email) {

    window.DOCS_AI = {
      userId: sessionData?.user.email,
      // userId can also be email or your system identifier
      additionalFields: {
        userEmail: sessionData.user.email,
        name: sessionData.user?.name ?? null,
        userId: sessionData.user.id,
        avatarUrl: sessionData.user?.image ?? null
      }
    }
  }

  return null

}

export default SetUserInWindow