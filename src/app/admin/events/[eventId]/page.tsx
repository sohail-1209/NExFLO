
import { getEventById, getRegistrationsByEventId } from "@/lib/data";
import { notFound } from "next/navigation";
import { headers } from 'next/headers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailsTab from "./_components/DetailsTab";
import { Calendar, Users, UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const RegistrationsTab = dynamic(() => import("./_components/RegistrationsTab"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px]" />,
});
const AttendanceTab = dynamic(() => import("./_components/AttendanceTab"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px]" />,
});


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
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">
            <Calendar className="w-4 h-4 mr-2"/>
            Details
          </TabsTrigger>
          <TabsTrigger value="registrations">
            <Users className="w-4 h-4 mr-2"/>
            Registrations
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <UserCheck className="w-4 h-4 mr-2"/>
            Attendance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <DetailsTab event={event} baseUrl={baseUrl} />
        </TabsContent>
        <TabsContent value="registrations">
          <RegistrationsTab registrations={registrations} event={event} />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceTab registrations={registrations} eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
