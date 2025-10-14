
"use client";

import type { Registration } from "@/lib/types";
import { updateRegistrationStatus } from "@/lib/actions";
import { useTransition, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, ExternalLink, List, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface RegistrationsTabProps {
  registrations: Registration[];
  eventId: string;
}

const statusConfig = {
    booked: { label: 'Booked', color: 'bg-green-500', icon: <Check className="h-3 w-3" /> },
    waitlisted: { label: 'Waitlisted', color: 'bg-yellow-500', icon: <List className="h-3 w-3" /> },
    pending: { label: 'Pending', color: 'bg-gray-500', icon: <Clock className="h-3 w-3" /> },
};


export default function RegistrationsTab({ registrations, eventId }: RegistrationsTabProps) {
  let [isPending, startTransition] = useTransition();

  const handleStatusChange = (registrationId: string, status: Registration['status']) => {
    startTransition(() => {
      updateRegistrationStatus(registrationId, eventId, status);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Registrations</CardTitle>
        <CardDescription>Review submissions and manage attendee status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>
                  <div className="font-medium">{reg.studentName}</div>
                  <div className="text-sm text-muted-foreground">{reg.studentEmail}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {reg.rollNumber} &bull; {reg.branch} &bull; Year {reg.yearOfStudy}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reg.mobileNumber} &bull; {reg.gender} &bull; Laptop: {reg.laptop ? "Yes" : "No"}
                  </div>
                </TableCell>
                <TableCell>
                  {reg.taskSubmission ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="outline" size="sm">
                          View Task <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Task Submission for {reg.studentName}</AlertDialogTitle>
                          <AlertDialogDescription>
                            The following URL was submitted for the task. You can copy it or open it in a new tab.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                         <div className="p-4 bg-muted rounded-md text-sm break-all">
                            <Link href={reg.taskSubmission} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {reg.taskSubmission}
                            </Link>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogAction>Close</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <span className="text-muted-foreground text-sm">Not submitted</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                    <Badge className="flex items-center gap-1.5 w-fit mx-auto" style={{ backgroundColor: statusConfig[reg.status].color }}>
                        {statusConfig[reg.status].icon}
                        {statusConfig[reg.status].label}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        disabled={!reg.taskSubmission || reg.status === "booked"}
                        onClick={() => handleStatusChange(reg.id, "booked")}
                      >
                        <Check className="mr-2 h-4 w-4" /> Approve (Book)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!reg.taskSubmission || reg.status === "waitlisted"}
                        onClick={() => handleStatusChange(reg.id, "waitlisted")}
                      >
                        <List className="mr-2 h-4 w-4" /> Waitlist
                      </DropdownMenuItem>
                       {reg.status === 'booked' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/mypass/${reg.id}`} target="_blank">
                           <ExternalLink className="mr-2 h-4 w-4" /> View Pass
                          </Link>
                        </DropdownMenuItem>
                       )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {registrations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No registrations yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
