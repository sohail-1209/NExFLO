
"use client";

import { useActionState, useEffect, useState, use, useTransition } from "react";
import { registerForEvent, suggestEmailCorrection } from "@/lib/actions";
import { getEventById } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { notFound } from "next/navigation";
import type { Event } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const initialState = {
  message: "",
  errors: {},
};

function SubmitButton({ isPastEvent }: { isPastEvent: boolean }) {
  return <Button type="submit" className="w-full" disabled={isPastEvent}>
      {isPastEvent ? "Registration Closed" : "Register"}
  </Button>;
}

export default function RegisterPage({ params: paramsPromise }: { params: { eventId: string } }) {
  const params = use(paramsPromise);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [isCheckingEmail, startEmailCheck] = useTransition();

  const { toast } = useToast();
  
  const registerForEventWithId = registerForEvent.bind(null, params.eventId);
  const [state, formAction] = useActionState(registerForEventWithId, initialState);
  
  const isPastEvent = event ? new Date() > event.date : false;

  useEffect(() => {
    async function fetchEvent() {
      if (!params.eventId) return;
      const eventData = await getEventById(params.eventId);
      if (!eventData) {
        notFound();
      }
      setEvent(eventData);
      setLoading(false);
    }
    fetchEvent();
  }, [params.eventId]);
  
  useEffect(() => {
    if (state.message && state.message.startsWith("Error")) {
      toast({
        title: "Registration Error",
        description: state.message,
        variant: "destructive"
      })
    }
  }, [state, toast]);

  const handleEmailBlur = () => {
    if (email && email.includes('@')) {
      startEmailCheck(async () => {
        setEmailSuggestion(null);
        const { suggestion } = await suggestEmailCorrection({ email });
        if (suggestion) {
          setEmailSuggestion(suggestion);
        }
      });
    }
  };

  const handleSuggestionClick = () => {
    if (emailSuggestion) {
      setEmail(emailSuggestion);
      setEmailSuggestion(null);
    }
  };

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
            {isPastEvent && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Registration Closed</AlertTitle>
                    <AlertDescription>The date for this event has already passed.</AlertDescription>
                </Alert>
            )}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Full Name</Label>
              <Input id="studentName" name="studentName" placeholder="Jane Doe" required disabled={isPastEvent} />
              {state?.errors?.studentName && <p className="text-sm text-destructive">{state.errors.studentName[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input id="rollNumber" name="rollNumber" placeholder="e.g. 21CS001" required disabled={isPastEvent} />
              {state?.errors?.rollNumber && <p className="text-sm text-destructive">{state.errors.rollNumber[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup name="gender" className="flex gap-4" disabled={isPastEvent}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
              {state?.errors?.gender && <p className="text-sm text-destructive">{state.errors.gender[0]}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                     <Input id="branch" name="branch" placeholder="e.g. Computer Science" required disabled={isPastEvent} />
                    {state?.errors?.branch && <p className="text-sm text-destructive">{state.errors.branch[0]}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="yearOfStudy">Year of Study</Label>
                    <Input id="yearOfStudy" name="yearOfStudy" type="number" placeholder="e.g. 3" required disabled={isPastEvent} />
                    {state?.errors?.yearOfStudy && <p className="text-sm text-destructive">{state.errors.yearOfStudy[0]}</p>}
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentEmail">Email Address</Label>
              <Input 
                id="studentEmail" 
                name="studentEmail" 
                type="email" 
                placeholder="jane.doe@example.com" 
                required 
                disabled={isPastEvent} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
              />
               {state?.errors?.studentEmail && <p className="text-sm text-destructive">{state.errors.studentEmail[0]}</p>}
               {isCheckingEmail && <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1"><Sparkles className="h-3 w-3 animate-pulse" />Checking for typos...</p>}
               {emailSuggestion && !isCheckingEmail && (
                 <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-primary h-auto p-0 text-xs"
                    onClick={handleSuggestionClick}
                  >
                    Did you mean: <span className="font-semibold">{emailSuggestion}</span>?
                  </Button>
               )}
            </div>
             <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" name="mobileNumber" type="tel" placeholder="123-456-7890" required disabled={isPastEvent} />
              {state?.errors?.mobileNumber && <p className="text-sm text-destructive">{state.errors.mobileNumber[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label>Will you bring a laptop?</Label>
              <RadioGroup name="laptop" className="flex gap-4" disabled={isPastEvent}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="laptop-yes" />
                  <Label htmlFor="laptop-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="laptop-no" />
                  <Label htmlFor="laptop-no">No</Label>
                </div>
              </RadioGroup>
              {state?.errors?.laptop && <p className="text-sm text-destructive">{state.errors.laptop[0]}</p>}
            </div>
            <SubmitButton isPastEvent={isPastEvent} />
          </form>
        </CardContent>
        <CardFooter>
            <Button asChild variant="outline" className="w-full">
                <Link href="/events"><ArrowLeft /> Go Back</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

