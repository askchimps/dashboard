"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganisationAgents } from "@/lib/hooks/organisation/use-organisation-agents";
import { IAgent } from "@/types/agent";

export default function AgentGrid() {
  const params = useParams();
  const { orgSlug } = params;

  const { data: agents } = useOrganisationAgents(orgSlug as string);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {agents?.map((agent: IAgent) => (
        <Link
          key={agent.name}
          href={`/${orgSlug}/agents/${agent.slug}`}
          prefetch
        >
          <Card
            key={agent.id}
            className="group relative h-64 cursor-pointer overflow-hidden border-0 bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] hover:ring-gray-300/80"
          >
            <div className="flex h-full flex-col">
              <CardHeader className="flex-none pb-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 ring-1 ring-blue-200/50">
                      <Image
                        src="/agent/agent.png"
                        alt="Agent"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white"></div>
                  </div>
                  <div className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold tracking-wider text-blue-600">
                    AGENT
                  </div>
                </div>
                <CardTitle className="line-clamp-2 text-lg leading-tight font-semibold tracking-tight text-gray-900 group-hover:text-blue-900">
                  {agent.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                <div className="flex h-full flex-col justify-end">
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Created</span>{" "}
                    <span className="font-medium text-gray-800">
                      {new Date(agent.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
