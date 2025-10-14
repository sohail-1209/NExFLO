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
import { ArrowLeft, BookImage, Mail, FileText, Pin } from "lucide-react";
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

          <div className="space-y-2">
            <Label htmlFor="date">Event Date and Time</Label>
            <Input id="date" name="date" type="datetime-local" />
             {state?.errors?.date && <p className="text-destructive text-sm">{state.errors.date[0]}</p>}
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
                <Textarea id="mailBody" name="mailBody" placeholder="e.g., Hi {studentName}, thanks for registering! Download the task here: {taskPdfLink}. Submit here: {taskSubmissionLink}"/>
                {state?.errors?.mailBody && <p className="text-destructive text-sm">{state.errors.mailBody[0]}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="taskPdfUrl">Task PDF</Label>
                <Input id="taskPdfUrl" name="taskPdfUrl" type="file" accept=".pdf" />
                {state?.errors?.taskPdfUrl && <p className="text-destructive text-sm">{state.errors.taskPdfUrl[0]}</p>}
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
             <h3 className="text-lg font-medium flex items-center gap-2"><BookImage className="w-5 h-5" /> Event Pass Details</h3>
              <div className="space-y-2">
                <Label htmlFor="passSubject">Pass Email Subject</Label>
                <Input id="passSubject" name="passSubject" placeholder="e.g., Your Pass for {eventName} is Here!" />
                {state?.errors?.passSubject && <p className="text-destructive text-sm">{state.errors.passSubject[0]}</p>}
              </div>

               <div className="space-y-2">
                <Label htmlFor="passBody">Pass Email Body</Label>
                <Textarea id="passBody" name="passBody" placeholder="e.g., Hi {studentName}, here is your pass!"/>
                {state?.errors?.passBody && <p className="text-destructive text-sm">{state.errors.passBody[0]}</p>}
              </div>

               <div className="space-y-2">
                <Label htmlFor="passLayoutUrl">Pass Layout Image</Label>
                <Input id="passLayoutUrl" name="passLayoutUrl" type="file" accept="image/*" />
                {state?.errors?.passLayoutUrl && <p className="text-destructive text-sm">{state.errors.passLayoutUrl[0]}</p>}
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2"><Pin className="w-4 h-4"/> Text Coordinates</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nameX">Name X</Label>
                        <Input id="nameX" name="nameX" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nameY">Name Y</Label>
                        <Input id="nameY" name="nameY" type="number" placeholder="100" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="rollNumberX">Roll No. X</Label>
                        <Input id="rollNumberX" name="rollNumberX" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rollNumberY">Roll No. Y</Label>
                        <Input id="rollNumberY" name="rollNumberY" type="number" placeholder="120" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="branchX">Branch X</Label>
                        <Input id="branchX" name="branchX" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="branchY">Branch Y</Label>
                        <Input id="branchY" name="branchY" type="number" placeholder="140" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="statusX">Status X</Label>
                        <Input id="statusX" name="statusX" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="statusY">Status Y</Label>
                        <Input id="statusY" name="statusY" type="number" placeholder="160" />
                    </div>
                </div>
                 {state?.errors?.nameX && <p className="text-destructive text-sm">All coordinates must be provided.</p>}
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
