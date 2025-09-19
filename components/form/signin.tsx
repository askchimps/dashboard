"use client";

import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signInAction } from "@/actions/signin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type ISignInForm, SignInFormSchema } from "@/types";
import { Loader2Icon } from "lucide-react";

export default function SignInForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<ISignInForm>({
    resolver: zodResolver(SignInFormSchema),
  });

  const email = watch("email");
  const password = watch("password");
  const isFormValid = email && password;

  const onSubmit = async ({ email, password }: ISignInForm) => {
    const response = await signInAction(email, password);

    if (!response.success) {
      toast.error(`SignIn Failed. ${response.message}`);
    } else {
      toast.success("SignIn Successful!");
      redirect("/");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
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
                <p className="text-red-500 text-xs">{errors.password.message}</p>
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
              {isLoading || isSubmitting && <Loader2Icon className="animate-spin" />}
              {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
