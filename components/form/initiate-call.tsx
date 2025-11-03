"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateCallAction } from "@/lib/api/actions/call/initiate-call";
import {
  type IInitiateCallForm,
  InitiateCallFormSchema,
} from "@/lib/types/form";
import { cn } from "@/lib/utils";

interface InitiateCallFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function InitiateCallForm({
  onSuccess,
  onCancel,
}: InitiateCallFormProps) {
  const params = useParams();
  const orgSlug = params.orgSlug as string;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isLoading },
    reset,
  } = useForm<IInitiateCallForm>({
    resolver: zodResolver(InitiateCallFormSchema),
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const mobileNumber = watch("mobileNumber");
  const isFormValid = firstName && lastName && mobileNumber;

  const onSubmit = async (data: IInitiateCallForm) => {
    try {
      const response = await initiateCallAction(data, orgSlug);

      if (!response.success) {
        toast.error(`Call Failed. ${response.message}`);
      } else {
        toast.success(response.message);
        reset(); // Clear the form
        onSuccess?.(); // Close the modal
      }
    } catch (error) {
      console.error("Error submitting call form:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={e => void handleSubmit(onSubmit)(e)}>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <Label className="text-md" htmlFor="firstName">
                First Name
              </Label>
              <Input
                {...register("firstName")}
                className={cn("py-5 text-sm", {
                  "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500":
                    Boolean(errors.firstName),
                })}
                id="firstName"
                placeholder="John"
                type="text"
                disabled={isSubmitting || isLoading}
              />
              {errors.firstName ? (
                <p className="text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <Label className="text-md" htmlFor="lastName">
                Last Name
              </Label>
              <Input
                {...register("lastName")}
                className={cn("py-5 text-sm", {
                  "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500":
                    Boolean(errors.lastName),
                })}
                id="lastName"
                placeholder="Doe"
                type="text"
                disabled={isSubmitting || isLoading}
              />
              {errors.lastName ? (
                <p className="text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-2">
              <Label className="text-md" htmlFor="mobileNumber">
                Mobile Number
              </Label>
              <Input
                {...register("mobileNumber")}
                className={cn("py-5 text-sm", {
                  "border border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500":
                    Boolean(errors.mobileNumber),
                })}
                id="mobileNumber"
                placeholder="1234567890"
                type="tel"
                maxLength={10}
                disabled={isSubmitting || isLoading}
              />
              {errors.mobileNumber ? (
                <p className="text-xs text-red-500">
                  {errors.mobileNumber.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              className="text-md flex w-full cursor-pointer gap-2"
              disabled={isSubmitting || isLoading || !isFormValid}
              type="submit"
              size="lg"
            >
              {isLoading || isSubmitting ? (
                <Loader2Icon className="animate-spin" />
              ) : null}
              {isSubmitting || isLoading
                ? "Initiating Call..."
                : "Initiate Call"}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={onCancel}
                disabled={isSubmitting || isLoading}
                className="text-md"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
