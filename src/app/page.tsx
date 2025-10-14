import Link from "next/link";
import { ArrowRight, Ticket, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/icons/Logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            NExFLO
          </h1>
        </div>
      </header>
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-primary mb-4">
              Event Management, Reimagined.
            </h2>
            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
              From registration and task handling to automated pass generation and
              attendance tracking, NExFLO has you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/events">
                  Browse Events
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/admin">
                  Admin Dashboard
                  <UserCog />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NExFLO. All rights reserved.</p>
      </footer>
    </div>
  );
}
