"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signUpAction } from "@/actions/signup";
import Button from "@/components/button/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ISignUpForm, SignUpFormSchema } from "@/types";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ISignUpForm>({
    resolver: zodResolver(SignUpFormSchema),
  });
  const [accountCreated, setAccountCreated] = useState(false);

  const onSubmit = async ({ name, email, password }: ISignUpForm) => {
    const response = await signUpAction(name, email, password);

    if (!response.success) {
      toast.error(`SignUp Failed. ${response.message}`);
    } else {
      setAccountCreated(true);
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-center items-center gap-1">
        <h1 className="font-semibold text-4xl">Get started</h1>
      </div>
      {accountCreated ? (
        <div className="animate-alert-banner pointer-events-auto flex items-center py-3 justify-between gap-x-6 px-6 text-center text-sm text-white sm:rounded-xl sm:pl-4 sm:pr-3 bg-violet-600">
          Account created successfully! Please check your email to confirm your
          account.
        </div>
      ) : null}
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-lg" htmlFor="name">
              Name
            </Label>
            <Input
              {...register("name")}
              className={cn("test-sm py-5", {
                "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500":
                  Boolean(errors.name),
              })}
              id="name"
              placeholder="John Doe"
              type="text"
            />
            {errors.name ? (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            ) : null}
          </div>
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
              placeholder="*********"
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
              label="Sign Up"
            />
          </div>
        </div>
      </form>
      <div className="text-md flex justify-center">
        Already have an account? &nbsp;
        <Link
          className="text-md text-primary font-bold transition-colors hover:text-purple-600 "
          type="button"
          href="/signin"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
