import { ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useOrganisations } from "@/lib/hooks/organisation/use-organisations";
import { IOrganisation } from "@/types/organisation";

export default function OrganisationSwitcher() {
  const { data: organisations, isLoading } = useOrganisations();
  const { isMobile } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const { orgSlug } = params;

  const [activeOrganisation, setActiveOrganisation] = useState(
    organisations?.find(org => org.slug === orgSlug)
  );

  useEffect(() => {
    const org = organisations?.find(org => org.slug === orgSlug);
    if (org) {
      setActiveOrganisation(org);
    } else {
      return notFound();
    }
  }, [orgSlug, organisations]);

  function handleOrganisationChange(organisation: IOrganisation) {
    router.push(`/${organisation.slug}`);
  }

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="bg-black/20 animate-pulse flex aspect-square size-8 items-center justify-center rounded-lg">
              <div className="size-4 rounded" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight gap-1">
              <div className="bg-black/20 animate-pulse h-3 w-24 rounded" />
              <div className="bg-black/20 animate-pulse h-3 w-16 rounded" />
            </div>
            <div className="bg-black/20 animate-pulse w-3 h-6 rounded ml-auto" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {orgSlug && activeOrganisation ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeOrganisation?.name}
                  </span>
                  <span className="truncate text-xs">
                    {activeOrganisation?.slug}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 max-h-96 overflow-auto rounded-lg no-scrollbar p-0 pb-2"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs sticky top-0 bg-white w-full z-20 p-3">
                Organisations
              </DropdownMenuLabel>
              {organisations?.map(organisation => (
                <DropdownMenuItem
                  key={organisation.name}
                  onClick={() => handleOrganisationChange(organisation)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <GalleryVerticalEnd className="size-3.5 shrink-0" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate">{organisation.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <SidebarMenuButton size="lg">
            <Image
              src="/logo/icon-logo.svg"
              alt="Logo"
              width={40}
              height={40}
            />
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
