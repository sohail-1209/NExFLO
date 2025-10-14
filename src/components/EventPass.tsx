import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event, Registration } from "@/lib/types";
import QRCodeDisplay from "./common/QRCodeDisplay";
import Logo from "./icons/Logo";
import { CheckCircle, Clock } from "lucide-react";

interface EventPassProps {
  registration: Registration;
  event: Event;
}

export default function EventPass({ registration, event }: EventPassProps) {
  const qrData = JSON.stringify({
    registrationId: registration.id,
    studentName: registration.studentName,
    studentEmail: registration.studentEmail,
    eventId: event.id
  });

  const isBooked = registration.status === 'booked';
  
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
        <div className="bg-primary/10 p-6">
            <div className="flex items-center gap-3">
                <Logo className="h-10 w-10 text-primary"/>
                <div>
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    <CardDescription>{event.date.toLocaleDateString()}</CardDescription>
                </div>
            </div>
        </div>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Attendee</p>
          <p className="font-semibold text-lg">{registration.studentName}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
           <Badge variant={isBooked ? "default" : "secondary"} className={isBooked ? "bg-green-500" : ""}>
            {isBooked ? <CheckCircle className="mr-2 h-4 w-4" /> : <Clock className="mr-2 h-4 w-4" />}
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </Badge>
        </div>

        {isBooked ? (
        <>
            <div className="border-t border-dashed my-4"></div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Scan for event check-in</p>
                <QRCodeDisplay url={qrData} size={200} />
            </div>
        </>
        ) : (
             <div className="border-t border-dashed my-4"></div>
             <p className="text-center text-muted-foreground">Your pass will be available here once your registration is approved.</p>
        )}
      </CardContent>
    </Card>
  );
}
