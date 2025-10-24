
import Link from "next/link";
import { getEvents } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Calendar, Users } from "lucide-react";
import { getRegistrationsByEventId } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default async function EventsPage() {
  const allEvents = await getEvents();
  const liveEvents = allEvents.filter(event => event.isLive && event.date > new Date());

  return (
    <div className="bg-background min-h-screen">
      <header className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">Upcoming Events</h1>
          <p className="mt-2 text-md md:text-lg text-muted-foreground text-center">Find your next learning opportunity.</p>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {liveEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {liveEvents.map(async (event) => {
              const registrations = await getRegistrationsByEventId(event.id);
              return (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                   <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{registrations.length} registered</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}/register`}>
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )})}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Events Scheduled</h2>
            <p className="text-muted-foreground mt-2">Please check back later for new events.</p>
          </div>
        )}
        <div className="mt-12 text-center">
            <Button variant="outline" asChild>
                <Link href="/">
                    <ArrowLeft /> Back to Home
                </Link>
            </Button>
        </div>
      </main>
    </div>
  );
}
