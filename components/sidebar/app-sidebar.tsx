"use client";

import {
  LogOut,
  PieChart,
  BarChart3,
  Phone,
  MessageCircle,
  Users,
  PhoneCall,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
  const params = useParams();

  const { orgSlug, orgTab } = params;

  async function handleSignOut() {
    await signOutAction();
    router.replace("/signin");
  }

  async function handleTabChange(tab: string) {
    router.push(`/${orgSlug}/${tab}`);
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
                tooltip={"Overview"}
                className="h-10 cursor-pointer [&>svg]:size-5"
                isActive={orgTab === "overview"}
                onClick={() => handleTabChange("overview")}
              >
                <BarChart3 />
                <span>Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Call Logs"}
                className="h-10 cursor-pointer [&>svg]:size-5"
                isActive={orgTab === "call-logs"}
                onClick={() => handleTabChange("call-logs")}
              >
                <Phone />
                <span>Call Logs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Chat Logs"}
                className="h-10 cursor-pointer [&>svg]:size-5"
                isActive={orgTab === "chat-logs"}
                onClick={() => handleTabChange("chat-logs")}
              >
                <MessageCircle />
                <span>Chat Logs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Leads"}
                className="h-10 cursor-pointer [&>svg]:size-5"
                isActive={orgTab === "leads"}
                onClick={() => handleTabChange("leads")}
              >
                <Users />
                <span>Leads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Test Calls"}
                className="h-10 cursor-pointer [&>svg]:size-5"
                isActive={orgTab === "test-calls"}
                onClick={() => handleTabChange("test-calls")}
              >
                <PhoneCall />
                <span>Test Calls</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Analytics"}
                className="h-10 cursor-pointer [&>svg]:size-5"
                isActive={orgTab === "analytics"}
                onClick={() => handleTabChange("analytics")}
              >
                <PieChart />
                <span>Analytics</span>
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
              className="h-10 cursor-pointer [&>svg]:size-5"
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
