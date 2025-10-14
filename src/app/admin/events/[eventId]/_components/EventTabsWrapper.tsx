
"use client";

import type { Event, Registration } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, UserCheck, Users } from "lucide-react";
import dynamic from "next/dynamic";
import DetailsTab from "./DetailsTab";

const RegistrationsTab = dynamic(() => import("./RegistrationsTab"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px]" />,
});
const AttendanceTab = dynamic(() => import("./AttendanceTab"), { 
  ssr: false,
  loading: () => <Skeleton className="w-full h-[300px]" />,
});

interface EventTabsWrapperProps {
  event: Event;
  registrations: Registration[];
  baseUrl: string;
}

export default function EventTabsWrapper({ event, registrations, baseUrl }: EventTabsWrapperProps) {
  return (
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
  );
}
