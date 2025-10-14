"use client";

import { useActionState, useEffect, useState, use } from "react";
import { submitTask } from "@/lib/actions";
import { getRegistrationById, getEventById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notFound } from "next/navigation";
import type { Event, Registration } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { CardFooter } from "@/components/ui/card";

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  return <Button type="submit" className="w-full">Submit Task</Button>;
}

export default function SubmitTaskPage({ params: paramsPromise }: { params: Promise<{ registrationId: string }> }) {
  const params = use(paramsPromise);
  const [data, setData] = useState<{ registration: Registration, event: Event } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const submitTaskWithId = submitTask.bind(null, params.registrationId);
  const [state, formAction] = useActionState(submitTaskWithId, initialState);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      const registration = await getRegistrationById(params.registrationId);
      if (!registration) notFound();
      const event = await getEventById(registration.eventId);
      if (!event) notFound();
      setData({ registration, event });
      if (registration.taskSubmission) {
        setSubmitted(true);
      }
      setLoading(false);
    }
    fetchData();
  }, [params.registrationId]);
  
  useEffect(() => {
    if (state.message) {
      if(state.message.includes("Error")) {
        toast({
            title: "Submission Error",
            description: state.message,
            variant: "destructive"
        });
      } else {
        toast({
            title: "Success",
            description: state.message,
        });
        setSubmitted(true);
      }
    }
  }, [state, toast]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  if (submitted) {
    return (
       <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <CardTitle className="mt-4 text-2xl">Task Submitted!</CardTitle>
                <CardDescription>
                    We've received your submission for <strong>{data?.event?.name}</strong>. Our team will review it shortly.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">You can close this page now. You'll be notified via email about your status.</p>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="outline" className="w-full">
                    <Link href="/events">
                        Back to Events
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Submit Task for {data?.event?.name}</CardTitle>
          <CardDescription>
            Hello, {data?.registration?.studentName}. Please provide a link to your completed task.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskSubmission">Submission URL</Label>
              <Input id="taskSubmission" name="taskSubmission" type="url" placeholder="https://github.com/your-repo" required />
              {state?.errors?.taskSubmission && <p className="text-sm text-destructive">{state.errors.taskSubmission[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
