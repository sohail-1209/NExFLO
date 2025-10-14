"use client";

import { useActionState, useEffect, useState, use } from "react";
import { registerForEvent } from "@/lib/actions";
import { getEventById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";
import type { Event } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  return <Button type="submit" className="w-full">Register</Button>;
}

export default function RegisterPage({ params: paramsPromise }: { params: Promise<{ eventId: string }> }) {
  const params = use(paramsPromise);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  
  const registerForEventWithId = registerForEvent.bind(null, params.eventId);
  const [state, formAction] = useActionState(registerForEventWithId, initialState);

  useEffect(() => {
    async function fetchEvent() {
      const eventData = await getEventById(params.eventId);
      if (!eventData) {
        notFound();
      }
      setEvent(eventData);
      setLoading(false);
    }
    fetchEvent();
  }, [params.eventId]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{event?.name}</CardTitle>
          <CardDescription>{event?.description}</CardDescription>
           <div className="flex items-center gap-2 pt-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{event?.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Full Name</Label>
              <Input id="studentName" name="studentName" placeholder="Jane Doe" required />
              {state?.errors?.studentName && <p className="text-sm text-destructive">{state.errors.studentName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Email Address</Label>
              <Input id="studentEmail" name="studentEmail" type="email" placeholder="jane.doe@example.com" required />
              {state?.errors?.studentEmail && <p className="text-sm text-destructive">{state.errors.studentEmail[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
