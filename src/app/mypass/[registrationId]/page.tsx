import EventPass from "@/components/EventPass";
import { getEventById, getRegistrationById } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MyPassPage({ params }: { params: { registrationId: string } }) {
  const registration = await getRegistrationById(params.registrationId);
  if (!registration) {
    notFound();
  }

  const event = await getEventById(registration.eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <EventPass registration={registration} event={event} />
      <Button asChild variant="outline">
        <Link href="/events">
          Back to Events
        </Link>
      </Button>
    </div>
  );
}
