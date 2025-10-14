import Link from "next/link";
import { Home, PlusCircle, Calendar, Settings } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Logo from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const events = await getEvents();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">EventFlow</span>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin" asChild>
                <Link href="/admin">
                  <Home />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="/admin/events/create" asChild>
                <Link href="/admin/events/create">
                  <PlusCircle />
                  Create Event
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
            Events
          </div>
          <SidebarMenu>
            {events.map((event) => (
              <SidebarMenuItem key={event.id}>
                <SidebarMenuButton href={`/admin/events/${event.id}`} asChild>
                  <Link href={`/admin/events/${event.id}`}>
                    <Calendar />
                    {event.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://picsum.photos/seed/admin/100/100" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-muted-foreground">admin@eventflow.com</span>
            </div>
             <Button variant="ghost" size="icon" className="ml-auto">
                <Settings className="w-4 h-4"/>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
