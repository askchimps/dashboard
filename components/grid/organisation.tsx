"use client";

import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganisations } from "@/lib/hooks/organisation/use-organisations";
import type { IOrganisation } from "@/types/organisation";

export default function OrganisationGrid() {
  const { data: organisations } = useOrganisations();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {organisations?.map((org: IOrganisation) => (
        <Link key={org.name} href={`/${org.slug}`} prefetch>
          <Card
            key={org.id}
            className="group relative cursor-pointer border border-gray-200/80 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
          >
            <CardHeader>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Image
                    src="/organisation/building.png"
                    alt="Organisation"
                    width={80}
                    height={80}
                  />
                </div>
                <div className="text-xs font-medium tracking-wide text-gray-400">
                  ORG
                </div>
              </div>
              <CardTitle className="text-lg leading-tight font-medium tracking-tight text-gray-900">
                {org.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-sm font-normal text-gray-500">
                Established{" "}
                <span className="font-medium text-gray-800">
                  {new Date(org.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
