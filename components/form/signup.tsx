"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/lib/api/actions/auth/signup";
import { type ISignUpForm, SignUpFormSchema } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<ISignUpForm>({
    resolver: zodResolver(SignUpFormSchema),
  });

  const [accountCreated, setAccountCreated] = useState(false);

  const name = watch("name");
  const email = watch("email");
  const password = watch("password");
  const isFormValid = name && email && password;

  const onSubmit = async ({ name, email, password }: ISignUpForm) => {
    const response = await signUpAction(name, email, password);

    if (!response.success) {
      toast.error(`SignUp Failed. ${response.message}`);
    } else {
      toast.success("SignUp Successful!");
      setAccountCreated(true);
      reset();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {accountCreated ? (
        <div className="rounded-md pointer-events-auto flex items-center py-3 justify-between gap-x-6 px-6 text-center text-sm text-white sm:pl-4 sm:pr-3 bg-violet-600">
          Account created successfully! Please check your email to confirm your
          account.
        </div>
      ) : null}
      <form onSubmit={e => void handleSubmit(onSubmit)(e)}>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label className="text-md" htmlFor="name">
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
              />
              {errors.name ? (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-md" htmlFor="email">
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
              <Label className="text-md" htmlFor="password">
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
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="text-md w-full flex gap-2 cursor-pointer"
              disabled={isSubmitting || isLoading || !isFormValid}
              type="submit"
              size="lg"
            >
              {isLoading ||
                (isSubmitting && <Loader2Icon className="animate-spin" />)}
              {isSubmitting || isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
