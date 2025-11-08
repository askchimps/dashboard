import CreditsNavbarDisplay from "@/components/credits-navbar-display";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="mt-16">
        <header className="bg-sidebar fixed top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex justify-between gap-2 px-4 w-[calc(100%-var(--sidebar-width))]">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <div>
              <CreditsNavbarDisplay />
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
