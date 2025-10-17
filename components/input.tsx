import clsx from "clsx";
import React, { useEffect, useRef, useState } from "react";

import { Error } from "@/components/error";

const sizes = {
  xSmall: "h-6 text-xs rounded-md",
  small: "h-8 text-sm rounded-md",
  mediumSmall: "h-10 text-sm rounded-md",
  medium: "h-10 text-sm rounded-md",
  large: "h-12 text-base rounded-lg",
};

interface InputProps {
  placeholder?: string;
  size?: keyof typeof sizes;
  prefix?: React.ReactNode | string;
  suffix?: React.ReactNode | string;
  prefixStyling?: boolean | string;
  suffixStyling?: boolean | string;
  disabled?: boolean;
  error?: string | boolean;
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ref?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  wrapperClassName?: string;
}

export const Input = ({
  placeholder,
  size = "medium",
  prefix,
  suffix,
  prefixStyling = true,
  suffixStyling = true,
  disabled = false,
  error,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  ref,
  className,
  wrapperClassName,
  ...rest
}: InputProps) => {
  const [_value, set_value] = useState(value || "");
  const internalRef = useRef<HTMLInputElement>(null);
  const _ref = ref || internalRef;

  const _onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_value(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  useEffect(() => {
    if (value !== undefined) {
      set_value(value);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-2" onClick={() => _ref.current?.focus()}>
      {label && (
        <div className="text-[13px] text-gray-900 capitalize">{label}</div>
      )}
      <div
        className={clsx(
          "flex items-center font-sans duration-150",
          error
            ? "shadow-error-input hover:shadow-error-input-hover"
            : "border-gray-alpha-400 hover:border-gray-alpha-500 focus-within:shadow-focus-input border focus-within:border-transparent",
          sizes[size],
          disabled ? "cursor-not-allowed bg-gray-100" : "bg-background-100",
          wrapperClassName
        )}
      >
        {prefix && (
          <div
            className={clsx(
              "flex h-full items-center justify-center fill-gray-700 text-gray-700",
              prefixStyling === true
                ? "bg-background-200 border-gray-alpha-400 border-r px-3"
                : `pl-3${!prefixStyling ? "" : ` ${prefixStyling}`}`,
              size === "large" ? "rounded-l-lg" : "rounded-l-md"
            )}
          >
            {prefix}
          </div>
        )}
        <input
          className={clsx(
            "inline-flex w-full appearance-none outline-none placeholder:text-gray-900 placeholder:opacity-70",
            size === "xSmall" || size === "mediumSmall" ? "px-2" : "px-3",
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-700"
              : "bg-background-100 text-geist-foreground",
            className
          )}
          placeholder={placeholder}
          disabled={disabled}
          value={_value}
          onChange={_onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          ref={_ref}
          {...rest}
        />
        {suffix && (
          <div
            className={clsx(
              "flex h-full items-center justify-center fill-gray-700 text-gray-700",
              suffixStyling === true
                ? "bg-background-200 border-gray-alpha-400 border-l px-3"
                : `pr-3 ${!suffixStyling ? "" : ` ${suffixStyling}`}`,
              size === "large" ? "rounded-r-lg" : "rounded-r-md"
            )}
          >
            {suffix}
          </div>
        )}
      </div>
      {typeof error === "string" && (
        <Error size={size === "large" ? "large" : "small"}>{error}</Error>
      )}
    </div>
  );
};
