import { Suspense } from "react";
import Image from "next/image";

import SignUpForm from "@/components/form/signup";

export default function SignUpPage() {
  return (
    <div className="p-5 flex flex-col gap-20 h-screen">
      {/* Logo */}
      <div className="flex justify-center gap-4">
        <Image
          src="/logo/full-logo.svg"
          alt="Full Askchimps Logo"
          width={200}
          height={48}
          priority
        />
      </div>
      {/* SignUp Form */}
      <Suspense fallback={<div>Loading...</div>}>
        <div className="w-full sm:max-w-96 sm:mx-auto">
          <SignUpForm />
        </div>
      </Suspense>
    </div>
  );
}
