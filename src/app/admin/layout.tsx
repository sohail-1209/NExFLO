"use client";

import { useUser } from "@/firebase/auth/use-user";
import Link from "next/link";
import { Home, PlusCircle, Calendar, LogOut, LogIn } from "lucide-react";
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
import { signOut as firebaseSignOut, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const auth = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEvents() {
      const eventData = await getEvents();
      setEvents(eventData);
    }
    if (user) {
        fetchEvents();
    }
  }, [user]);

   const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error signing in: ", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
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
        <div className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold tracking-tight text-center">Admin Sign In</h2>
            <p className="text-muted-foreground mb-4 text-center">Enter your credentials to access the dashboard.</p>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                <LogIn className="mr-2" />
                Sign In
              </Button>
            </form>
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
              <AvatarFallback>{user.email?.substring(0,2).toUpperCase() ?? 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.displayName ?? user.email}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
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
