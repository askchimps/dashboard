"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

interface IButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
  hasGradientBottom?: boolean;
  type?: "button" | "submit" | "reset";
}

function Button({
  label,
  href,
  onClick,
  variant = "primary",
  disabled = false,
  className,
  hasGradientBottom = false,
  type = "button",
}: IButtonProps) {
  const buttonClasses = cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-80 shadow rounded-md px-8 relative h-10 w-full text-base dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90",
    {
      "bg-zinc-950 text-white hover:bg-zinc-900": variant === "primary",
      "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50":
        variant === "secondary",
      "bg-red-500 text-zinc-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-zinc-50 dark:hover:bg-red-900/90":
        variant === "danger",
    },
    className,
  );

  const buttonContent = (
    <div
      className={cn("relative block", {
        "mb-2": hasGradientBottom,
      })}
    >
      {hasGradientBottom ? (
        <div className="absolute bottom-2 h-4 w-full translate-y-full rounded-b-lg bg-gradient-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
      ) : null}
      <button
        className={buttonClasses}
        type={type}
        onClick={onClick}
        disabled={disabled}
        title={label}
        aria-label={label}
      >
        {label}
      </button>
    </div>
  );

  return href ? (
    <Link className="contents" href={href}>
      {buttonContent}
    </Link>
  ) : (
    buttonContent
  );
}

export default Button;
