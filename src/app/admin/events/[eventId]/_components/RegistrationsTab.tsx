
"use client";

import type { Registration, Event } from "@/lib/types";
import { updateRegistrationStatus, updateEventPassDetails } from "@/lib/actions";
import { useTransition, useState, useActionState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Clock, ExternalLink, List, MoreVertical, BookImage, Settings, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RegistrationsTabProps {
  registrations: Registration[];
  event: Event;
}

const statusConfig = {
    booked: { label: 'Booked', color: 'bg-green-500', icon: <>✅</> },
    waitlisted: { label: 'Waitlisted', color: 'bg-yellow-500', icon: <>⚠️</> },
    pending: { label: 'Pending', color: 'bg-gray-500', icon: <Clock className="h-3 w-3" /> },
    denied: { label: 'Denied', color: 'bg-red-500', icon: <Ban className="h-3 w-3" /> },
};

const passInitialState = {
  message: "",
  errors: {},
};


export default function RegistrationsTab({ registrations, event }: RegistrationsTabProps) {
  let [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedRegForDenial, setSelectedRegForDenial] = useState<Registration | null>(null);
  const [denyConfirmationText, setDenyConfirmationText] = useState("");

  const sortedRegistrations = useMemo(() => {
    return [...registrations].sort((a, b) => {
      const aTime = a.taskSubmittedAt?.getTime() ?? 0;
      const bTime = b.taskSubmittedAt?.getTime() ?? 0;
      return bTime - aTime;
    });
  }, [registrations]);


  const updatePassDetailsWithId = updateEventPassDetails.bind(null, event.id);
  const [passState, passFormAction] = useActionState(updatePassDetailsWithId, passInitialState);

  const handleStatusChange = (registrationId: string, status: Registration['status']) => {
    startTransition(async () => {
      const result = await updateRegistrationStatus(registrationId, event.id, status);
      if (result.success) {
        toast({ title: "Success", description: result.message });
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
      setDenyDialogOpen(false);
      setSelectedRegForDenial(null);
      setDenyConfirmationText("");
    });
  };

  const openDenyDialog = (reg: Registration) => {
    setSelectedRegForDenial(reg);
    setDenyDialogOpen(true);
  }

  useEffect(() => {
    if (passState.message) {
      if (passState.message.startsWith("Error")) {
        toast({ title: "Error", description: passState.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: passState.message });
        setOpen(false);
      }
    }
  }, [passState, toast]);


  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Manage Registrations</CardTitle>
            <CardDescription>Review submissions and manage attendee status. Sorted by most recent submission.</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto"><Settings className="mr-2 h-4 w-4" /> Configure Pass</Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <form action={passFormAction}>
                  <DialogHeader>
                      <DialogTitle>Configure Event Pass Email</DialogTitle>
                      <DialogDescription>Set up the email that delivers the event pass to approved attendees.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                       <div className="space-y-4">
                          <h3 className="text-lg font-medium flex items-center gap-2"><BookImage className="w-5 h-5" /> Event Pass Email Details</h3>
                          <div className="space-y-2">
                              <Label htmlFor="passSubject">Pass Email Subject</Label>
                              <Input id="passSubject" name="passSubject" placeholder="e.g., Your Pass for {eventName} is Here!" defaultValue={event.passSubject} />
                              {passState?.errors?.passSubject && <p className="text-destructive text-sm">{passState.errors.passSubject[0]}</p>}
                          </div>

                          <div className="space-y-2">
                              <Label htmlFor="passBody">Pass Email Body</Label>
                              <Textarea id="passBody" name="passBody" placeholder="e.g., Hi {studentName}, here is your pass!" defaultValue={event.passBody} rows={5} />
                               <p className="text-xs text-muted-foreground">The generated pass image will be automatically attached below this content.</p>
                              {passState?.errors?.passBody && <p className="text-destructive text-sm">{passState.errors.passBody[0]}</p>}
                          </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <DialogClose asChild>
                          <Button type="button" variant="secondary">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save Configuration</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
          </Dialog>

        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2">Student</TableHead>
                  <TableHead className="hidden md:table-cell px-2">Details</TableHead>
                  <TableHead className="px-2">Submission</TableHead>
                  <TableHead className="text-center px-2">Status</TableHead>
                  <TableHead className="text-right px-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRegistrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="p-2">
                      <div className="font-medium break-all">{reg.studentName}</div>
                      <div className="text-sm text-muted-foreground break-all">{reg.studentEmail}</div>
                       <div className="text-sm text-muted-foreground md:hidden mt-1">
                        {reg.rollNumber}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell p-2">
                      <div className="text-sm text-muted-foreground">
                        {reg.rollNumber} &bull; {reg.branch} &bull; Year {reg.yearOfStudy}
                      </div>
                       <div className="text-sm text-muted-foreground">
                        {reg.mobileNumber} &bull; {reg.gender} &bull; Laptop: {reg.laptop ? "Yes" : "No"}
                      </div>
                    </TableCell>
                    <TableCell className="p-2">
                      {reg.taskSubmission ? (
                        <Dialog>
                          <DialogTrigger asChild>
                             <Button variant="outline" size="sm">
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Task Submission for {reg.studentName}</DialogTitle>
                              <DialogDescription>
                                Submitted on: {reg.taskSubmittedAt ? reg.taskSubmittedAt.toLocaleString() : 'N/A'}
                              </DialogDescription>
                            </DialogHeader>
                             <div className="p-4 bg-muted rounded-md text-sm break-all">
                                <Link href={reg.taskSubmission} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {reg.taskSubmission}
                                </Link>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button">Close</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not submitted</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center p-2">
                        <Badge className="flex items-center gap-1.5 w-fit mx-auto" style={{ backgroundColor: statusConfig[reg.status].color }}>
                            {statusConfig[reg.status].icon}
                            {statusConfig[reg.status].label}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right p-2">
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
                           <DropdownMenuSeparator />
                           <DropdownMenuItem
                              className="text-red-500 focus:text-red-500"
                              disabled={reg.status === "denied"}
                              onClick={() => openDenyDialog(reg)}
                            >
                             <Ban className="mr-2 h-4 w-4" /> Deny
                           </DropdownMenuItem>
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
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Denial</DialogTitle>
            <DialogDescription>
              This will permanently deny the registration for <span className="font-bold">{selectedRegForDenial?.studentName}</span>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="deny-confirm">To confirm, please type 'deny' below:</Label>
            <Input 
              id="deny-confirm"
              value={denyConfirmationText}
              onChange={(e) => setDenyConfirmationText(e.target.value)}
              placeholder="deny"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={isPending || denyConfirmationText.toLowerCase() !== 'deny'}
              onClick={() => selectedRegForDenial && handleStatusChange(selectedRegForDenial.id, 'denied')}
            >
              {isPending ? 'Denying...' : 'Confirm Denial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
