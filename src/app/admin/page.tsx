
import Link from "next/link";
import { getEvents, getRegistrationsByEventId } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function AdminDashboard() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of all your events.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Manage your events and view their registration status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Event</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-center">Registrations</TableHead>
                  <TableHead className="hidden sm:table-cell text-center">Status</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map(async (event) => {
                  const registrations = await getRegistrationsByEventId(event.id);
                  const isUpcoming = event.date > new Date();
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="py-2 pl-4">
                        <div className="font-medium break-all">{event.name}</div>
                        <div className="text-sm text-muted-foreground hidden md:inline break-all">
                          {event.description.substring(0, 50)}...
                        </div>
                         <div className="text-sm text-muted-foreground mt-1 sm:hidden">
                           <Badge variant={isUpcoming ? "default" : "secondary"}>
                            {isUpcoming ? "Upcoming" : "Finished"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-2 px-2">
                        {event.date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-center py-2 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{registrations.length}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-center py-2 px-2">
                        <Badge variant={isUpcoming ? "default" : "secondary"}>
                          {isUpcoming ? "Upcoming" : "Finished"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-2 pr-4">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/events/${event.id}`}>
                            <ArrowRight className="h-4 w-4" />
                            <span className="sr-only">Manage</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
