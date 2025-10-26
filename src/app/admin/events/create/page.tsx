
"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { createEvent } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Shield, Calendar as CalendarIcon, Users, Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

const initialState = {
  message: "",
  errors: {} as Record<string, string[]>,
  eventId: null,
};


export default function CreateEventPage() {
  const [state, formAction] = useActionState(createEvent, initialState);
  const { toast } = useToast();
  const [showCustomEmail, setShowCustomEmail] = useState(false);


  useEffect(() => {
    if (state?.message && state.message.startsWith("Error")) {
      toast({
        title: "Error Creating Event",
        description: state.message.replace("Error: ", ""),
        variant: "destructive",
      });
    }
  }, [state, toast]);

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
              {state?.errors?.name && <p className="text-destructive text-sm mt-1">{state.errors.name[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="A brief summary of your event." />
              {state?.errors?.description && <p className="text-destructive text-sm mt-1">{state.errors.description[0]}</p>}
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="date">Event Date and Time</Label>
                  <Input id="date" name="date" type="datetime-local" />
                  {state?.errors?.date && <p className="text-destructive text-sm mt-1">{state.errors.date[0]}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input id="venue" name="venue" placeholder="e.g., Online or Conference Hall A" />
                  {state?.errors?.venue && <p className="text-destructive text-sm mt-1">{state.errors.venue[0]}</p>}
              </div>
            </div>
            
            <Separator />

             <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2"><Users className="w-5 h-5" /> Registration Restrictions</h3>
                 <div className="space-y-2">
                    <Label>Allowed Years of Study</Label>
                     <p className="text-sm text-muted-foreground">Select which years can register. Leave all unchecked to allow everyone.</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        {[1, 2, 3, 4, 5].map((year) => (
                            <div key={year} className="flex items-center gap-2">
                                <Checkbox id={`year-${year}`} name="allowedYears" value={year.toString()} />
                                <Label htmlFor={`year-${year}`} className="font-normal">
                                    {year === 5 ? 'Other' : `${year}${year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year`}
                                </Label>
                            </div>
                        ))}
                    </div>
                     {state?.errors?.allowedYears && <p className="text-destructive text-sm mt-1">{state.errors.allowedYears[0]}</p>}
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2"><Mail className="w-5 h-5" /> Registration & Pass Details</h3>
              <div className="space-y-2">
                  <Label htmlFor="confirmationMessage">Confirmation Message (after registration form)</Label>
                  <Textarea id="confirmationMessage" name="confirmationMessage" placeholder="Message shown to users after they register."/>
                  {state?.errors?.confirmationMessage && <p className="text-destructive text-sm mt-1">{state.errors.confirmationMessage[0]}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="mailSubject">Registration Email Subject</Label>
                  <Input id="mailSubject" name="mailSubject" placeholder="e.g., Your Registration for {eventName}" />
                  {state?.errors?.mailSubject && <p className="text-destructive text-sm mt-1">{state.errors.mailSubject[0]}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="mailBody">Registration Email Body</Label>
                  <Textarea id="mailBody" name="mailBody" placeholder="e.g., Hi {studentName}, thanks for registering!"/>
                   {state?.errors?.mailBody && <p className="text-destructive text-sm mt-1">{state.errors.mailBody[0]}</p>}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="taskPdfUrl">Task PDF (Optional)</Label>
                  <Input id="taskPdfUrl" name="taskPdfUrl" type="file" accept=".pdf" />
                  <p className="text-xs text-muted-foreground">If you attach a task, users must submit it to get a pass. If not, they get a pass instantly.</p>
                  {state?.errors?.taskPdfUrl && <p className="text-destructive text-sm mt-1">{state.errors.taskPdfUrl[0]}</p>}
              </div>
            </div>

            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2"><Palette className="w-5 h-5" /> Email & Pass Styling</h3>
              <p className="text-sm text-muted-foreground">Customize the colors of the email and pass for this event. Uses theme colors if left blank.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input id="primaryColor" name="primaryColor" type="color" defaultValue="#BB86FC" />
                  {state?.errors?.primaryColor && <p className="text-destructive text-sm mt-1">{state.errors.primaryColor[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color (Text on Primary)</Label>
                  <Input id="accentColor" name="accentColor" type="color" defaultValue="#121212" />
                  {state?.errors?.accentColor && <p className="text-destructive text-sm mt-1">{state.errors.accentColor[0]}</p>}
                </div>
              </div>
            </div>
            
             <Separator />

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch id="custom-email-toggle" checked={showCustomEmail} onCheckedChange={setShowCustomEmail} />
                    <Label htmlFor="custom-email-toggle" className="flex items-center gap-2 cursor-pointer">
                        <Shield className="w-5 h-5" />
                        Use Custom Email Sender (Optional)
                    </Label>
                </div>
                 <p className="text-sm text-muted-foreground">Enable this to send emails from a specific Gmail account. Otherwise, the default system email will be used.</p>
                
                {showCustomEmail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="appMail">Custom App Email</Label>
                            <Input id="appMail" name="appMail" type="email" placeholder="your-email@gmail.com" />
                            {state?.errors?.appMail && <p className="text-destructive text-sm mt-1">{state.errors.appMail[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appPass">Custom App Password</Label>
                            <Input id="appPass" name="appPass" type="password" placeholder="16-digit app password" />
                            {state?.errors?.appPass && <p className="text-destructive text-sm mt-1">{state.errors.appPass[0]}</p>}
                        </div>
                    </div>
                )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
              <Button asChild variant="outline">
                  <Link href="/admin"><ArrowLeft /> Go Back</Link>
              </Button>
              <Button type="submit">Create Event</Button>
          </CardFooter>
        </form>
    </Card>
  );
}
