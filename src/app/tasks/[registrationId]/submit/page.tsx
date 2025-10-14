"use client";

import { useActionState, useEffect, useState, use } from "react";
import { getRegistrationById, getEventById } from "@/lib/data";
import { notFound, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Download, Upload } from "lucide-react";
import type { Event, Registration } from "@/lib/types";
import { submitTask } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  return (
    <Button type="submit" className="w-full">
      <Upload className="mr-2 h-4 w-4" />
      Submit Task
    </Button>
  );
}

export default function TaskSubmissionPage({ params }: { params: { registrationId: string } }) {
  const [data, setData] = useState<{ registration: Registration, event: Event } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const { toast } = useToast();
  const submitTaskWithId = submitTask.bind(null, params.registrationId);
  const [state, formAction] = useActionState(submitTaskWithId, initialState);

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
      if (state.message.includes("Error")) {
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  if (!data) return null;

  const { registration, event } = data;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Task Submission</CardTitle>
          <CardDescription>
            Submit your completed task for the event: <strong>{event.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitted ? (
             <div className="space-y-4 text-center">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold">Task Already Submitted!</h3>
                <p className="text-muted-foreground">We've already received your submission. Our team will review it and you'll be notified via email about your status.</p>
                <p className="text-sm text-muted-foreground pt-2">You can view your submission at: <br/><Link href={registration.taskSubmission!} className="text-primary hover:underline" target="_blank">{registration.taskSubmission}</Link></p>
             </div>
          ) : (
            <>
              <Alert>
                <Download className="h-4 w-4" />
                <AlertTitle>Download the Task</AlertTitle>
                <AlertDescription>
                    <p>Complete the required task to confirm your spot. You can download it here.</p>
                    <Button asChild variant="secondary" size="sm" className="mt-2">
                        <Link href={event.taskPdfUrl} target="_blank">
                            <Download className="mr-2 h-4 w-4" />
                            Download Task PDF
                        </Link>
                    </Button>
                </AlertDescription>
              </Alert>

              <form action={formAction} className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label htmlFor="taskSubmission">Submission URL</Label>
                  <Input id="taskSubmission" name="taskSubmission" type="url" placeholder="https://github.com/your-repo-link" required />
                  {state?.errors?.taskSubmission && <p className="text-sm text-destructive">{state.errors.taskSubmission[0]}</p>}
                </div>
                <SubmitButton />
              </form>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/events"><ArrowLeft /> Back to Events</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
