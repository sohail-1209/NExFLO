
"use client";

import { useEffect, useState, use, useActionState } from "react";
import { getRegistrationById, getEventById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Mail, Send } from "lucide-react";
import type { Event, Registration } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { resendRegistrationEmail } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const initialState = {
    message: "",
    success: false,
};


export default function RegistrationSuccessPage({ params: paramsPromise }: { params: { registrationId: string } }) {
  const params = use(paramsPromise);
  const [data, setData] = useState<{ registration: Registration, event: Event } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const handleResendEmail = async () => {
    if (!params.registrationId) return;

    const result = await resendRegistrationEmail(params.registrationId);

    if (result.success) {
      toast({
        title: "Email Sent!",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    async function fetchData() {
      if(!params.registrationId) return;
      const registration = await getRegistrationById(params.registrationId);
      if (!registration) notFound();
      const event = await getEventById(registration.eventId);
      if (!event) notFound();
      setData({ registration, event });
      setLoading(false);
    }
    fetchData();
  }, [params.registrationId]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
             <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                    <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-12 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
             </Card>
        </div>
    )
  }
  
  if (!data) return null;

  const { registration, event } = data;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
            <CheckCircle className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl">Registration Successful!</CardTitle>
          <CardDescription>
             Thank you, {registration.studentName}. You're on the list for {event.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">{event.confirmationMessage}</p>
            <div className="p-4 bg-muted/50 rounded-lg text-left">
                <h3 className="font-semibold flex items-center gap-2"><Mail className="h-4 w-4" />What's Next?</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    We've sent a confirmation to <span className="font-semibold text-foreground">{registration.studentEmail}</span>. Please check your inbox for the event task and a link to submit your work. Your spot will be confirmed upon approval of your submission.
                </p>
            </div>
             <div className="text-sm text-muted-foreground">
                <p>Didn't receive the email?</p>
                <Button variant="link" onClick={handleResendEmail} className="text-primary">
                    <Send className="mr-2 h-4 w-4" />
                    Resend Confirmation Email
                </Button>
            </div>
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
