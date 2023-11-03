import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import PrimaryButton from "~/components/form/button";

export const AuthButton: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">

      {!sessionData ?
        <PrimaryButton className="w-[150px]"
          onClick={sessionData ? () => void signOut() : () => void signIn()}
        >
          {sessionData ? "Sign out" : "Get started"}
        </PrimaryButton> :
        <Link href="/dashboard">
          <PrimaryButton className="w-[150px]">Dashboard</PrimaryButton>
        </Link>
      }
    </div>
  );
};
