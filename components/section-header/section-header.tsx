import type { JSX } from "react";

interface ISectionHeaderProps {
  label: string;
  children?: JSX.Element;
}

export default function SectionHeader({
  label,
  children,
}: ISectionHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-black md:text-3xl">{label}</h1>
      </div>
      {children}
    </div>
  );
}
