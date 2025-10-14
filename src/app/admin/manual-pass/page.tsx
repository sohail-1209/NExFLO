
"use client";

import { useActionState, useEffect, useState } from "react";
import { sendManualPass, sendBulkPasses } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Send, UploadCloud, Users, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Papa from "papaparse";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const singleInitialState = { message: "", errors: {} };
const bulkInitialState = { message: "", errors: {} };

type Attendee = {
    "Full Name": string;
    "E - Mail": string;
    [key: string]: any;
};

export default function ManualPassPage() {
  const [singleState, singleFormAction] = useActionState(sendManualPass, singleInitialState);
  const [bulkState, bulkFormAction] = useActionState(sendBulkPasses, bulkInitialState);

  const { toast } = useToast();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);

  useEffect(() => {
    const state = singleState.message ? singleState : bulkState;
    if (state?.message) {
      if (state.message.startsWith("Error")) {
        toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: state.message,
        });
        setAttendees([]);
        setCsvFileName(null);
      }
    }
  }, [singleState, bulkState, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      Papa.parse<Attendee>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const validAttendees = results.data.filter(
            (attendee) => attendee["Full Name"] && attendee["E - Mail"]
          );
          setAttendees(validAttendees);
        },
        error: (error) => {
          toast({
            title: "CSV Parsing Error",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <div className="space-y-8">
        <Card className="w-full max-w-2xl mx-auto">
        <form action={singleFormAction}>
            <CardHeader>
            <CardTitle>Send Single Pass or Email</CardTitle>
            <CardDescription>
                Fill out the details to send a one-off event pass or a custom email to an attendee.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="studentName">Attendee Name</Label>
                <Input id="studentName" name="studentName" placeholder="e.g., John Doe" required />
                {singleState?.errors?.studentName && <p className="text-destructive text-sm">{singleState.errors.studentName[0]}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="studentEmail">Attendee Email</Label>
                <Input id="studentEmail" name="studentEmail" type="email" placeholder="e.g., john.doe@example.com" required />
                {singleState?.errors?.studentEmail && <p className="text-destructive text-sm">{singleState.errors.studentEmail[0]}</p>}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input id="eventName" name="eventName" placeholder="e.g., Annual Tech Summit" required />
                {singleState?.errors?.eventName && <p className="text-destructive text-sm">{singleState.errors.eventName[0]}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" name="eventDate" type="datetime-local" required />
                {singleState?.errors?.eventDate && <p className="text-destructive text-sm">{singleState.errors.eventDate[0]}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="eventVenue">Event Venue</Label>
                <Input id="eventVenue" name="eventVenue" placeholder="e.g., Grand Exhibition Hall" required />
                {singleState?.errors?.eventVenue && <p className="text-destructive text-sm">{singleState.errors.eventVenue[0]}</p>}
            </div>

            <Separator/>
            
            <h3 className="text-lg font-medium">Email Customization</h3>
            
            <div className="space-y-2">
                <Label htmlFor="emailSubject">Email Subject</Label>
                <Input id="emailSubject" name="emailSubject" placeholder="Your Pass for {eventName}" required />
                {singleState?.errors?.emailSubject && <p className="text-destructive text-sm">{singleState.errors.emailSubject[0]}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="emailBody">Email Body</Label>
                <Textarea id="emailBody" name="emailBody" rows={5} placeholder="Hi {studentName}, here is your pass for the event." required />
                <p className="text-xs text-muted-foreground">
                You can use placeholders like {"{studentName}"} and {"{eventName}"}.
                </p>
                {singleState?.errors?.emailBody && <p className="text-destructive text-sm">{singleState.errors.emailBody[0]}</p>}
            </div>

            <div className="flex items-center space-x-2">
                <Switch id="sendWithoutPass" name="sendWithoutPass" />
                <Label htmlFor="sendWithoutPass">Send normal email (without pass attachment)</Label>
            </div>

            <Separator/>
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button variant="link" className="p-0 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Custom Email Sender (Optional)
                    </Button>
                </CollapsibleTrigger>
                 <p className="text-sm text-muted-foreground">Provide credentials to send this email from a specific account.</p>
                <CollapsibleContent className="pt-4 space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="appMail">Custom App Email</Label>
                            <Input id="appMail" name="appMail" type="email" placeholder="your-email@gmail.com" />
                            {singleState?.errors?.appMail && <p className="text-destructive text-sm">{singleState.errors.appMail[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appPass">Custom App Password</Label>
                            <Input id="appPass" name="appPass" type="password" placeholder="16-digit app password" />
                            {singleState?.errors?.appPass && <p className="text-destructive text-sm">{singleState.errors.appPass[0]}</p>}
                        </div>
                     </div>
                </CollapsibleContent>
            </Collapsible>

            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full md:w-auto">
                <Send className="mr-2 h-4 w-4" />
                Send Email
            </Button>
            </CardFooter>
        </form>
        </Card>

        <Card className="w-full max-w-2xl mx-auto">
        <form action={bulkFormAction}>
             <CardHeader>
                <CardTitle>Send Bulk Passes or Emails</CardTitle>
                <CardDescription>
                    Upload a CSV file to send passes or emails to multiple attendees at once.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {/* Shared event details for bulk sending */}
                 <div className="space-y-2">
                    <Label htmlFor="bulk_eventName">Event Name</Label>
                    <Input id="bulk_eventName" name="eventName" placeholder="e.g., Annual Tech Summit" required />
                     {bulkState?.errors?.eventName && <p className="text-destructive text-sm">{bulkState.errors.eventName[0]}</p>}
                </div>
                {/* ... other shared fields ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="bulk_eventDate">Event Date</Label>
                        <Input id="bulk_eventDate" name="eventDate" type="datetime-local" required />
                        {bulkState?.errors?.eventDate && <p className="text-destructive text-sm">{bulkState.errors.eventDate[0]}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="bulk_eventVenue">Event Venue</Label>
                        <Input id="bulk_eventVenue" name="eventVenue" placeholder="e.g., Grand Exhibition Hall" required />
                        {bulkState?.errors?.eventVenue && <p className="text-destructive text-sm">{bulkState.errors.eventVenue[0]}</p>}
                    </div>
                </div>

                <Separator />
                <h3 className="text-lg font-medium">Bulk Email Customization</h3>
                <div className="space-y-2">
                    <Label htmlFor="bulk_emailSubject">Email Subject</Label>
                    <Input id="bulk_emailSubject" name="emailSubject" placeholder="Your Pass for {eventName}" required />
                    {bulkState?.errors?.emailSubject && <p className="text-destructive text-sm">{bulkState.errors.emailSubject[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bulk_emailBody">Email Body</Label>
                    <Textarea id="bulk_emailBody" name="emailBody" rows={5} placeholder="Hi {Full Name}, here is your pass for the event." required />
                    <p className="text-xs text-muted-foreground">
                       Use CSV headers as placeholders, e.g., {"{Full Name}"}, {"{E - Mail}"}, {"{Roll Number}"}.
                    </p>
                    {bulkState?.errors?.emailBody && <p className="text-destructive text-sm">{bulkState.errors.emailBody[0]}</p>}
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="bulk_sendWithoutPass" name="sendWithoutPass" />
                    <Label htmlFor="bulk_sendWithoutPass">Send normal email (without pass attachment)</Label>
                </div>
                
                <Separator />
                <Collapsible>
                    <CollapsibleTrigger asChild>
                         <Button variant="link" className="p-0 flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Custom Email Sender (Optional)
                        </Button>
                    </CollapsibleTrigger>
                     <p className="text-sm text-muted-foreground">Provide credentials to send these bulk emails from a specific account.</p>
                    <CollapsibleContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bulk_appMail">Custom App Email</Label>
                                <Input id="bulk_appMail" name="appMail" type="email" placeholder="your-email@gmail.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bulk_appPass">Custom App Password</Label>
                                <Input id="bulk_appPass" name="appPass" type="password" placeholder="16-digit app password" />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <Separator />
                <h3 className="text-lg font-medium">Upload Attendees</h3>
                 <div className="space-y-2">
                    <Label htmlFor="csvFile">CSV File</Label>
                    <Input id="csvFile" name="csvFile" type="file" accept=".csv" onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                     {bulkState?.errors?.attendees && <p className="text-destructive text-sm">{bulkState.errors.attendees[0]}</p>}
                </div>
                {/* Hidden input to pass attendee data to server action */}
                <input type="hidden" name="attendees" value={JSON.stringify(attendees)} />

                {attendees.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="flex items-center gap-2"><Users className="h-4 w-4"/>Recipients ({attendees.length})</Label>
                            <Badge variant="secondary">{csvFileName}</Badge>
                        </div>
                        <ScrollArea className="h-40 w-full rounded-md border p-2">
                            <div className="space-y-2">
                                {attendees.map((attendee, index) => (
                                    <div key={index} className="text-sm p-2 bg-muted/50 rounded-md">
                                        <p className="font-semibold">{attendee["Full Name"]}</p>
                                        <p className="text-muted-foreground">{attendee["E - Mail"]}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}


            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full md:w-auto" disabled={attendees.length === 0}>
                    <Send className="mr-2 h-4 w-4" />
                    Send to {attendees.length} Attendees
                </Button>
            </CardFooter>
        </form>
        </Card>
    </div>
  );
}
