
"use client";

import type { Event } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, FileText, Mail, Link as LinkIcon, MapPin, Power, Users } from "lucide-react";
import QRCodeDisplay from "@/components/common/QRCodeDisplay";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTransition, useState, useEffect } from "react";
import { toggleEventStatus } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";

interface DetailsTabProps {
  event: Event;
  baseUrl: string; // This will be initially empty
}

export default function DetailsTab({ event }: DetailsTabProps) {
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Construct the URL on the client side to ensure it's always correct and stable.
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/events/${event.id}/register`;
      setRegistrationUrl(url);
    }
  }, [event.id]);
  
  const copyToClipboard = () => {
    if (!registrationUrl) return;
    navigator.clipboard.writeText(registrationUrl);
    toast({
        title: "Copied to clipboard!",
        description: "The registration link has been copied."
    });
  }

  const handleStatusToggle = (isLive: boolean) => {
    startTransition(async () => {
      const result = await toggleEventStatus(event.id, isLive);
      if (result.success) {
        toast({ title: "Success", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    });
  }
  
  const yearMapping = (year: number) => {
      switch(year) {
          case 1: return "1st Year";
          case 2: return "2nd Year";
          case 3: return "3rd Year";
          case 4: return "4th Year";
          case 5: return "Other";
          default: return `${year}th Year`;
      }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Event Status</CardTitle>
            <div className="flex items-center space-x-2">
                <Switch 
                    id="live-status" 
                    checked={event.isLive}
                    onCheckedChange={handleStatusToggle}
                    disabled={isPending}
                    aria-label="Toggle event status"
                />
                <Label htmlFor="live-status" className={`font-semibold ${event.isLive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPending ? 'Updating...' : (event.isLive ? 'Live' : 'Disabled')}
                </Label>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              When an event is live, the registration page is open. When disabled, it will show a "registration closed" message.
            </p>
          </CardContent>
        </Card>
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
            {event.venue && (
                 <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">Venue</h3>
                        <p className="text-muted-foreground">{event.venue}</p>
                    </div>
                </div>
            )}
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
            {event.taskPdfUrl ? (
                <div className="flex items-start gap-4">
                <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                    <h3 className="font-semibold">Task PDF</h3>
                    <a href={event.taskPdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{event.taskPdfUrl}</a>
                </div>
                </div>
            ) : (
                 <div className="flex items-start gap-4">
                    <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                    <div>
                        <h3 className="font-semibold">Task PDF</h3>
                        <p className="text-muted-foreground">No task PDF for this event. Passes are issued instantly.</p>
                    </div>
                </div>
            )}
             <div className="flex items-start gap-4">
                <Users className="h-5 w-5 mt-1 text-muted-foreground" />
                <div>
                    <h3 className="font-semibold">Allowed Years</h3>
                     {event.allowedYears.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {event.allowedYears.map(year => <Badge key={year} variant="secondary">{yearMapping(year)}</Badge>)}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">All years are allowed to register.</p>
                    )}
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
          <CardContent className="flex flex-col justify-center items-center gap-4">
            {registrationUrl ? <QRCodeDisplay url={registrationUrl} /> : <div className="w-[250px] h-[250px] bg-muted rounded-md animate-pulse" />}
            <div 
              className="p-2 bg-muted rounded-md text-sm text-center break-all"
            >
              <p className="text-muted-foreground">{registrationUrl || "Generating link..."}</p>
            </div>
             <Button onClick={copyToClipboard} variant="outline" size="sm" disabled={!registrationUrl}>
                <LinkIcon className="mr-2 h-4 w-4"/>
                Copy Link
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
