
"use client";

import { useActionState, useEffect } from "react";
import { sendManualPass } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Send } from "lucide-react";

const initialState = {
  message: "",
  errors: {},
};

export default function ManualPassPage() {
  const [state, formAction] = useActionState(sendManualPass, initialState);
  const { toast } = useToast();

  useEffect(() => {
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
      }
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Send Manual Pass or Email</CardTitle>
          <CardDescription>
            Fill out the details to send a one-off event pass or a custom email to an attendee.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Attendee Name</Label>
              <Input id="studentName" name="studentName" placeholder="e.g., John Doe" required />
              {state?.errors?.studentName && <p className="text-destructive text-sm">{state.errors.studentName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Attendee Email</Label>
              <Input id="studentEmail" name="studentEmail" type="email" placeholder="e.g., john.doe@example.com" required />
              {state?.errors?.studentEmail && <p className="text-destructive text-sm">{state.errors.studentEmail[0]}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input id="eventName" name="eventName" placeholder="e.g., Annual Tech Summit" required />
              {state?.errors?.eventName && <p className="text-destructive text-sm">{state.errors.eventName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" name="eventDate" type="datetime-local" required />
              {state?.errors?.eventDate && <p className="text-destructive text-sm">{state.errors.eventDate[0]}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventVenue">Event Venue</Label>
            <Input id="eventVenue" name="eventVenue" placeholder="e.g., Grand Exhibition Hall" required />
            {state?.errors?.eventVenue && <p className="text-destructive text-sm">{state.errors.eventVenue[0]}</p>}
          </div>

          <hr/>
          
          <h3 className="text-lg font-medium">Email Customization</h3>
          
          <div className="space-y-2">
            <Label htmlFor="emailSubject">Email Subject</Label>
            <Input id="emailSubject" name="emailSubject" placeholder="Your Pass for {eventName}" required />
            {state?.errors?.emailSubject && <p className="text-destructive text-sm">{state.errors.emailSubject[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailBody">Email Body</Label>
            <Textarea id="emailBody" name="emailBody" rows={5} placeholder="Hi {studentName}, here is your pass for the event." required />
            <p className="text-xs text-muted-foreground">
              You can use placeholders like {"{studentName}"} and {"{eventName}"}.
            </p>
            {state?.errors?.emailBody && <p className="text-destructive text-sm">{state.errors.emailBody[0]}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="sendWithoutPass" name="sendWithoutPass" />
            <Label htmlFor="sendWithoutPass">Send normal email (without pass attachment)</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto">
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
