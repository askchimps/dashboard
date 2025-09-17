"use client";

import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signInAction } from "@/actions/signin";
import Button from "@/components/button/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ISignInForm, SignInFormSchema } from "@/types";

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ISignInForm>({
    resolver: zodResolver(SignInFormSchema),
  });

  const onSubmit = async ({ email, password }: ISignInForm) => {
    const response = await signInAction(email, password);

    if (!response.success) {
      toast.error(`SignIn Failed. ${response.message}`);
    } else {
      redirect("/");
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-center items-center gap-1">
        <h1 className="font-semibold text-4xl">Welcome back</h1>
      </div>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-lg" htmlFor="email">
              Email
            </Label>
            <Input
              {...register("email")}
              className={cn("test-sm py-5", {
                "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500":
                  Boolean(errors.email),
              })}
              id="email"
              placeholder="name@example.com"
              type="email"
            />
            {errors.email ? (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-lg" htmlFor="password">
              Password
            </Label>
            <Input
              {...register("password")}
              className={cn("test-sm py-5", {
                "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500":
                  Boolean(errors.password),
              })}
              id="password"
              placeholder="*************"
              type="password"
            />
            {errors.password ? (
              <p className="text-red-500 text-xs">{errors.password.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="text-xs w-full"
              disabled={isSubmitting}
              type="submit"
              label="Sign In"
            />
          </div>
        </div>
      </form>
      {/* <div className="text-md flex justify-center">
        Don't have an account? &nbsp;
        <Link
          className="text-md text-primary font-bold transition-colors hover:text-purple-600 "
          type="button"
          href="/signup"
        >
          Sign up
        </Link>
      </div> */}
    </div>
  );
}
