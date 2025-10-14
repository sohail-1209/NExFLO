"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  message: "",
  errors: {},
  eventId: null,
};

function SubmitButton() {
  return <Button type="submit">Create Event</Button>;
}

export default function CreateEventPage() {
  const [state, formAction] = useFormState(createEvent, initialState);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === "success" && state.eventId) {
      toast({
        title: "Event Created!",
        description: "Your new event has been successfully created.",
      });
      router.push(`/admin/events/${state.eventId}`);
    } else if (state.message && state.message.startsWith("Error")) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, router, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Fill out the details below to set up your new event.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="date">Event Date and Time</Label>
            <Input id="date" name="date" type="datetime-local" />
             {state?.errors?.date && <p className="text-destructive text-sm">{state.errors.date[0]}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmationMessage">Confirmation Message</Label>
            <Textarea id="confirmationMessage" name="confirmationMessage" placeholder="Message shown to users after they register."/>
             {state?.errors?.confirmationMessage && <p className="text-destructive text-sm">{state.errors.confirmationMessage[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskPdfUrl">Task PDF URL</Label>
            <Input id="taskPdfUrl" name="taskPdfUrl" placeholder="https://example.com/task.pdf" defaultValue="/mock-task.pdf" />
             {state?.errors?.taskPdfUrl && <p className="text-destructive text-sm">{state.errors.taskPdfUrl[0]}</p>}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
