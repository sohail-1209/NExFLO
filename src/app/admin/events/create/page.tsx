
"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createEvent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const initialState = {
  message: "",
  errors: {},
  eventId: null,
};

function SubmitButton() {
  return <Button type="submit">Create Event</Button>;
}

export default function CreateEventPage() {
  const [state, formAction] = useActionState(createEvent, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message && state.message.startsWith("Error")) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, router, toast]);

  return (
    <Card>
       <form action={formAction}>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Fill out the details below to set up your new event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" name="name" placeholder="e.g., Next.js Conf" />
            {state?.errors?.name && <p className="text-destructive text-sm">{state.errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="A brief summary of your event." />
             {state?.errors?.description && <p className="text-destructive text-sm">{state.errors.description[0]}</p>}
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="date">Event Date and Time</Label>
                <Input id="date" name="date" type="datetime-local" />
                {state?.errors?.date && <p className="text-destructive text-sm">{state.errors.date[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" placeholder="e.g., Online or Conference Hall A" />
                {state?.errors?.venue && <p className="text-destructive text-sm">{state.errors.venue[0]}</p>}
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2"><Mail className="w-5 h-5" /> Registration Email</h3>
            <div className="space-y-2">
                <Label htmlFor="confirmationMessage">Confirmation Message (after registration form)</Label>
                <Textarea id="confirmationMessage" name="confirmationMessage" placeholder="Message shown to users after they register."/>
                {state?.errors?.confirmationMessage && <p className="text-destructive text-sm">{state.errors.confirmationMessage[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="mailSubject">Registration Email Subject</Label>
                <Input id="mailSubject" name="mailSubject" placeholder="e.g., Your Registration for {eventName}" />
                {state?.errors?.mailSubject && <p className="text-destructive text-sm">{state.errors.mailSubject[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="mailBody">Registration Email Body</Label>
                <Textarea id="mailBody" name="mailBody" placeholder="e.g., Hi {studentName}, thanks for registering!"/>
                {state?.errors?.mailBody && <p className="text-destructive text-sm">{state.errors.mailBody[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="taskPdfUrl">Task PDF</Label>
                <Input id="taskPdfUrl" name="taskPdfUrl" type="file" accept=".pdf" />
                {state?.errors?.taskPdfUrl && <p className="text-destructive text-sm">{state.errors.taskPdfUrl[0]}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
                <Link href="/admin"><ArrowLeft /> Go Back</Link>
            </Button>
            <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
