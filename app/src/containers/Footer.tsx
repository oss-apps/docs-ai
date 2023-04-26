import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="mx-auto  max-w-6xl pb-10">
      {'<!--email_off-->'}
      <p className="text-center text-lg text-gray-500">contact: hey@docsai.app</p>
      {'<!--/email_off-->'}
      <div className="mt-4 flex gap-2 mx-auto justify-center items-center">
        <Link href="/terms" className="text-zinc-500 hover:underline underline-offset-2">
          Terms
        </Link>
        <p className="text-zinc-500">·</p>
        <Link href="/privacy" className="text-zinc-500 hover:underline underline-offset-2">
          Privacy
        </Link>
        <p className="text-zinc-500">·</p>
        <Link href="/pricing" className="text-zinc-500 hover:underline underline-offset-2">
          Pricing
        </Link>
      </div>
      <p className="mt-4 text-center text-zinc-500">Made with ❤️ by <a className="text-zinc-900 hover:underline underline-offset-2" href="https://twitter.com/KM_Koushik_" target="_blank" rel="noreferrer">Koushik</a></p>
    </footer>
  );
};

export default Footer;