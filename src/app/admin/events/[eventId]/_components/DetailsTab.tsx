import type { Event } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, FileText, Mail } from "lucide-react";
import QRCodeDisplay from "@/components/common/QRCodeDisplay";

interface DetailsTabProps {
  event: Event;
}

export default function DetailsTab({ event }: DetailsTabProps) {
  const registrationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/events/${event.id}/register`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Date & Time</h3>
                <p className="text-muted-foreground">{event.date.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="h-5 w-5 mt-1 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Confirmation Message</h3>
                <p className="text-muted-foreground">{event.confirmationMessage}</p>
              </div>
            </div>
             <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Registration Email</h3>
                <p className="text-sm font-medium">{event.mailSubject}</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.mailBody}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Task PDF</h3>
                <a href={event.taskPdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{event.taskPdfUrl}</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Registration QR Code</CardTitle>
            <CardDescription>Scan to open the registration form.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <QRCodeDisplay url={registrationUrl} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
