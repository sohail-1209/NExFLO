import { getRegistrationById, getEventById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Download, Upload } from "lucide-react";

export default async function RegistrationSuccessPage({ params }: { params: { registrationId: string } }) {
  const registration = await getRegistrationById(params.registrationId);
  if (!registration) {
    notFound();
  }

  const event = await getEventById(registration.eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
            <CheckCircle className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl">Registration Successful!</CardTitle>
          <CardDescription>
            Thank you, {registration.studentName}. You're on the list for <strong>{event.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{event.confirmationMessage}</p>
          <div className="p-4 bg-muted/50 rounded-lg text-left">
            <h3 className="font-semibold">Next Steps:</h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Complete the required task to confirm your spot.</li>
              <li>Submit your task before the deadline.</li>
              <li>You'll receive an email with your event pass upon approval.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button asChild variant="secondary" className="w-full">
              <Link href={event.taskPdfUrl} target="_blank">
                <Download className="mr-2 h-4 w-4" />
                Download Task
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href={`/tasks/${registration.id}/submit`}>
                <Upload className="mr-2 h-4 w-4" />
                Submit Task
              </Link>
            </Button>
          </div>
          <Button asChild variant="outline" className="w-full">
              <Link href="/events"><ArrowLeft /> Back to Events</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
