
import { getEventById, getRegistrationsByEventId } from "@/lib/data";
import { notFound } from "next/navigation";
import { headers } from 'next/headers';
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EventTabsWrapper from "./_components/EventTabsWrapper";


export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const event = await getEventById(params.eventId);
  if (!event) {
    notFound();
  }
  const registrations = await getRegistrationsByEventId(params.eventId);
  
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
         <Button asChild variant="outline" size="icon">
            <Link href="/admin">
                <ArrowLeft />
                <span className="sr-only">Go back</span>
            </Link>
        </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <p className="text-muted-foreground">{event.description}</p>
        </div>
      </div>
      <EventTabsWrapper
        event={event}
        registrations={registrations}
        baseUrl={baseUrl}
      />
    </div>
  );
}
