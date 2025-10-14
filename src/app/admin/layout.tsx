"use client";

import { useUser } from "@/firebase/auth/use-user";
import Link from "next/link";
import { Home, PlusCircle, Calendar, Settings, LogOut, LogIn } from "lucide-react";
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
import { useEffect, useState } from "react";
import type { Event } from "@/lib/types";
import { signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth } from "@/firebase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const auth = useAuth();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      const eventData = await getEvents();
      setEvents(eventData);
    }
    fetchEvents();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
         <div className="flex items-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                EventFlow Admin
            </h1>
        </div>
        <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">You need to be signed in to view this page.</p>
            <Button onClick={signInWithGoogle}>
                <LogIn className="mr-2" />
                Sign in with Google
            </Button>
        </div>
      </div>
    );
  }


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
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
              <AvatarFallback>{user.displayName?.substring(0,2) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.displayName}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
             <Button variant="ghost" size="icon" className="ml-auto" onClick={signOut}>
                <LogOut className="w-4 h-4"/>
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
