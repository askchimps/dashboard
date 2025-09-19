import Link from "next/link";
import Image from "next/image";
import SignUpForm from "@/components/form/signup";

export default function SignUpPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 flex-col items-center justify-center justify-items-center overflow-hidden rounded-3xl border bg-background lg:max-h-[900px] lg:grid-cols-2">
      <div className="flex h-full w-full flex-col justify-center gap-8 p-6 lg:p-20 lg:border-r">
        <div className="flex flex-col items-center justify-center gap-2 lg:items-start lg:justify-start">
          <h1 className="text-pretty text-center font-semibold text-4xl leading-[130%] tracking-tight lg:text-left">Let's get you started</h1>
          <p className="text-center text-paragraph-3 text-md leading-tight tracking-tight lg:text-left">Securely create your account in seconds.</p>
        </div>
        <SignUpForm />
        <p className="w-[80%] self-center text-pretty text-center text-paragraph-3 text-sm lg:w-full" >By continuing, you agree to our <Link className="underline underline-offset-4 hover:text-primary" href="/legal/terms">Terms of Service</Link> and <Link className="underline underline-offset-4 hover:text-primary" href="/legal/privacy">Privacy Policy</Link>.</p>
      </div>
      <div className="hidden relative h-full w-full items-center justify-center bg-muted lg:flex">
        <Image
          src="/auth/signup.jpeg"
          alt="Sign up for an account"
          fill
          priority
        />
      </div>
    </div>
  );
}
