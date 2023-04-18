import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import PrimaryButton from "~/components/form/button";

export const AuthButton: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">

      {!sessionData ?
        <PrimaryButton
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </PrimaryButton> :
        <Link href="/dashboard">
          <PrimaryButton>Dashboard</PrimaryButton>
        </Link>
      }
    </div>
  );
};
