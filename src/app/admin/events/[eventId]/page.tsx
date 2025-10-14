import { getEventById, getRegistrationsByEventId } from "@/lib/data";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailsTab from "./_components/DetailsTab";
import RegistrationsTab from "./_components/RegistrationsTab";
import AttendanceTab from "./_components/AttendanceTab";
import { Calendar, Users, QrCode } from "lucide-react";

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const event = await getEventById(params.eventId);
  if (!event) {
    notFound();
  }
  const registrations = await getRegistrationsByEventId(params.eventId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
        <p className="text-muted-foreground">{event.description}</p>
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
            <QrCode className="w-4 h-4 mr-2"/>
            Attendance
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <DetailsTab event={event} />
        </TabsContent>
        <TabsContent value="registrations">
          <RegistrationsTab registrations={registrations} eventId={event.id} />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceTab registrations={registrations} eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
