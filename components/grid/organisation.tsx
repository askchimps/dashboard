"use client";

import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganisations } from "@/lib/hooks/organisation/use-organisations";
import type { IOrganisation } from "@/types/organisation";

export default function OrganisationGrid() {
  const { data: organisations } = useOrganisations();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {organisations?.map((org: IOrganisation) => (
        <Link key={org.name} href={`/${org.slug}`} prefetch>
          <Card
            key={org.id}
            className="group relative bg-white border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                  <Image
                    src="/organisation/building.png"
                    alt="Organisation"
                    width={80}
                    height={80}
                  />
                </div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">
                  ORG
                </div>
              </div>
              <CardTitle className="text-lg font-medium text-gray-900 leading-tight tracking-tight">
                {org.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-gray-500 font-normal">
                Established{" "}
                <span className="text-gray-800 font-medium">
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
