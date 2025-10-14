
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event, Registration } from "@/lib/types";
import QRCodeDisplay from "./common/QRCodeDisplay";
import Logo from "./icons/Logo";
import { CheckCircle, Clock, List } from "lucide-react";

interface EventPassProps {
  registration: Registration;
  event: Event;
}

const statusConfig = {
    booked: { label: 'Booked', color: 'bg-green-500', icon: <CheckCircle className="mr-2 h-4 w-4" /> },
    waitlisted: { label: 'Waitlisted', color: 'bg-yellow-500', icon: <List className="mr-2 h-4 w-4" /> },
    pending: { label: 'Pending', color: 'bg-gray-500', icon: <Clock className="mr-2 h-4 w-4" /> },
    denied: { label: 'Denied', color: 'bg-red-500', icon: <Clock className="mr-2 h-4 w-4" /> },
};


export default function EventPass({ registration, event }: EventPassProps) {
  const qrData = JSON.stringify({
    registrationId: registration.id,
    studentName: registration.studentName,
    studentEmail: registration.studentEmail,
    rollNumber: registration.rollNumber,
    eventId: event.id
  });

  const showQrCode = registration.status === 'booked' || registration.status === 'waitlisted';
  const currentStatus = statusConfig[registration.status];

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
          <p className="text-sm text-muted-foreground">{registration.rollNumber}</p>
          <p className="text-sm text-muted-foreground">{registration.branch} &bull; Year {registration.yearOfStudy}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
           <Badge variant={registration.status === 'booked' ? 'default' : 'secondary'} style={currentStatus ? { backgroundColor: currentStatus.color } : {}}>
             {currentStatus.icon}
             {currentStatus.label}
          </Badge>
        </div>

        {showQrCode ? (
        <>
            <div className="border-t border-dashed my-4"></div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">Scan for event check-in</p>
                <QRCodeDisplay url={qrData} size={200} />
            </div>
        </>
        ) : (
             <>
                <div className="border-t border-dashed my-4"></div>
                <p className="text-center text-muted-foreground">Your pass and QR code will be available here once your registration is approved.</p>
             </>
        )}
      </CardContent>
    </Card>
  );
}
