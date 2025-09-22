"use client";

import { Bot, LogOut, PieChart } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import OrganisationSwitcher from "@/components/sidebar/organisation-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { signOutAction } from "@/lib/api/actions/auth/signout";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    router.replace("/signin");
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganisationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Agents"}
                className="cursor-pointer [&>svg]:size-5 h-10"
              >
                <Bot />
                <span>Agents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Usage"}
                className="cursor-pointer [&>svg]:size-5 h-10"
              >
                <PieChart />
                <span>Usage</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
              className="cursor-pointer [&>svg]:size-5 h-10"
            >
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
