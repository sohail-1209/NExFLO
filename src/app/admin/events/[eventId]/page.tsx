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
  
  // Using a static domain ensures the QR code is consistent.
  // Replace this with your actual domain when deploying.
  const baseUrl = "https://your-domain.com";

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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{event.name}</h1>
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
