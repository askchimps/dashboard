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
            className="group relative h-64 cursor-pointer overflow-hidden border-0 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/60 transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] hover:ring-gray-300/80 hover:scale-[1.02]"
          >
            <div className="flex h-full flex-col">
              <CardHeader className="flex-none pb-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 ring-1 ring-emerald-200/50">
                      <Image
                        src="/organisation/building.png"
                        alt="Organisation"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white"></div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold tracking-wider text-emerald-600">
                    ORG
                  </div>
                </div>
                <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight tracking-tight text-gray-900 group-hover:text-emerald-900">
                  {org.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                <div className="flex h-full flex-col justify-end">
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Established</span>{" "}
                    <span className="font-medium text-gray-800">
                      {new Date(org.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
