
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Frown } from "lucide-react";
import Link from "next/link";

export default function RegistrationClosedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit">
            <Frown className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl">Registration Closed</CardTitle>
          <CardDescription>
            Unfortunately, registration for this event is no longer open.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You missed this one, but there are always more opportunities ahead. Better luck next time!</p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/events"><ArrowLeft /> See Other Events</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
