import Image from "next/image";
import Link from "next/link";

import SignInForm from "@/components/form/signin";

export default function SignInPage() {
  return (
    <div className="bg-background mx-auto grid w-full max-w-7xl flex-1 flex-col items-center justify-center justify-items-center overflow-hidden rounded-3xl border lg:max-h-[900px] lg:grid-cols-2">
      <div className="flex h-full w-full flex-col justify-center gap-8 p-6 lg:border-r lg:p-20">
        <div className="flex flex-col items-center justify-center gap-2 lg:items-start lg:justify-start">
          <h1 className="text-center text-4xl leading-[130%] font-semibold tracking-tight text-pretty lg:text-left">
            Welcome back
          </h1>
          <p className="text-paragraph-3 text-md text-center leading-tight tracking-tight lg:text-left">
            Log in to access your account.
          </p>
        </div>
        <SignInForm />
        <p className="text-paragraph-3 w-[80%] self-center text-center text-sm text-pretty lg:w-full">
          By continuing, you agree to our{" "}
          <Link
            className="hover:text-primary underline underline-offset-4"
            href="/legal/terms"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            className="hover:text-primary underline underline-offset-4"
            href="/legal/privacy"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div className="bg-muted relative hidden h-full w-full items-center justify-center lg:flex">
        <Image
          src="/auth/signin.jpeg"
          alt="Sign in to your account"
          fill
          priority
        />
      </div>
    </div>
  );
}
